// Browser test of the built site (dist/): serves it locally, opens it in the installed Edge or Chrome (headless) at
// desktop, tablet and phone widths, and checks navigation, charts, diagrams, equations, references and layout.
//
//     npm run build && npm run check            screenshots go to tools/screenshots/
//     node tools/check.mjs --links              also requests every reference URL
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIST = join(ROOT, "dist");
const SHOTS = join(ROOT, "tools", "screenshots");
const BROWSERS = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".json": "application/json" };

const failures = [];
const check = (ok, msg) => { console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`); if (!ok) failures.push(msg); };

const server = createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (path.endsWith("/")) path += "index.html";
  const file = normalize(join(DIST, path));
  if (!file.startsWith(DIST) || !existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
}).listen(0);
const url = `http://127.0.0.1:${server.address().port}/`;

const executablePath = BROWSERS.find(existsSync);
if (!executablePath) throw new Error("no Edge or Chrome found");
mkdirSync(SHOTS, { recursive: true });
const browser = await puppeteer.launch({ executablePath, headless: true, args: ["--no-first-run"] });

try {
  for (const [name, width, height] of [["desktop", 1366, 900], ["tablet", 820, 1100], ["phone", 390, 844]]) {
    console.log(`\n== ${name} (${width}px)`);
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && !/fonts\.(googleapis|gstatic)/.test(m.text()) && errors.push(m.text()));
    await page.setViewport({ width, height });
    await page.goto(url, { waitUntil: "networkidle0" });
    // diagrams load lazily (Mermaid); wait until all have rendered or failed
    await page.waitForFunction(() => [...document.querySelectorAll(".diagram-body")].every((d) => d.querySelector("svg") || d.querySelector(".diagram-error")), { timeout: 60000 });

    // the thesis figures load lazily: bring each into view once so they are loaded before measuring
    for (const img of await page.$$(".thesis-figure img")) {
      await img.scrollIntoView();
      await page.waitForFunction((el) => el.complete && el.naturalWidth > 0, { timeout: 20000 }, img).catch(() => {});
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    const info = await page.evaluate(() => {
      const ids = [...document.querySelectorAll(".nav-links a")].map((a) => a.getAttribute("href").slice(1));
      const refs = [...document.querySelectorAll(".references li")];
      return {
        navIds: ids,
        missingTargets: ids.filter((id) => !document.getElementById(id)),
        sections: [...document.querySelectorAll("main section")].map((s) => s.id),
        diagrams: document.querySelectorAll(".diagram-body svg[id^='mmd']").length,
        illustrations: document.querySelectorAll(".congestion-svg").length,
        diagramErrors: [...document.querySelectorAll(".diagram-error")].map((e) => e.textContent.slice(0, 200)),
        charts: document.querySelectorAll(".recharts-wrapper > svg.recharts-surface").length,
        bars: document.querySelectorAll(".recharts-bar-rectangle").length,
        lines: document.querySelectorAll(".recharts-line-curve").length,
        equations: document.querySelectorAll(".equation .katex-display").length,
        katexErrors: document.querySelectorAll(".katex-error").length,
        images: [...document.querySelectorAll(".thesis-figure img")].map((i) => ({ src: i.getAttribute("src"), ok: i.complete && i.naturalWidth > 0 })),
        refCount: refs.length,
        refNumbers: refs.map((li) => li.id),
        refLinks: refs.map((li) => li.querySelector("a.ref-link")).filter(Boolean).map((a) => ({ href: a.href, target: a.target, rel: a.rel })),
        citeTargets: [...document.querySelectorAll(".cite a")].map((a) => a.getAttribute("href")),
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        wideBlocks: [...document.querySelectorAll("main *")].filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.right > window.innerWidth + 1 && !el.closest(".table-wrap, .diagram-body, .equation-body, .nav-links, .katex-mathml");
        }).slice(0, 5).map((el) => el.className || el.tagName),
      };
    });

    check(info.missingTargets.length === 0, `all ${info.navIds.length} navigation links have a target section`);
    check(info.diagrams === 2 && info.illustrations === 1 && info.diagramErrors.length === 0,
      `2 Mermaid diagrams + 1 illustration rendered (found ${info.diagrams} + ${info.illustrations}${info.diagramErrors.length ? ", errors: " + info.diagramErrors.join(" | ") : ""})`);
    check(info.charts === 9, `9 charts rendered (found ${info.charts}; ${info.bars} bars, ${info.lines} lines)`);
    check(info.equations >= 12 && info.katexErrors === 0, `${info.equations} display equations, ${info.katexErrors} KaTeX errors`);
    check(info.images.length === 3 && info.images.every((i) => i.ok), `3 thesis figures loaded (${info.images.filter((i) => !i.ok).map((i) => i.src).join(", ") || "all ok"})`);
    check(info.refCount === 36 && info.refNumbers.every((id, k) => id === `ref-${k + 1}`), `36 references numbered 1..36 (found ${info.refCount})`);
    check(info.refLinks.length === 36 && info.refLinks.every((a) => a.target === "_blank" && a.rel.includes("noopener")), `36 reference links open in a new tab`);
    const missingCites = info.citeTargets.filter((h) => !info.refNumbers.includes(h.slice(1)));
    check(info.citeTargets.length > 0 && missingCites.length === 0, `${info.citeTargets.length} in-text citations all point to a reference`);
    check(info.overflow <= 0 && info.wideBlocks.length === 0, `no horizontal page overflow (overflow ${info.overflow}px${info.wideBlocks.length ? "; wide: " + info.wideBlocks.join(", ") : ""})`);

    // click every navigation link: the section must end up just below the sticky bar
    let navOk = 0;
    for (const id of info.navIds) {
      await page.evaluate(() => window.scrollTo(0, 0));
      if (await page.$(".menu-button") && await page.$eval(".menu-button", (b) => getComputedStyle(b).display !== "none")) {
        await page.click(".menu-button");
      }
      await page.click(`.nav-links a[href="#${id}"]`);
      // wait until the smooth scroll has come to rest
      let last = -1, still = 0;
      for (let k = 0; k < 60 && still < 4; k++) {
        await new Promise((r) => setTimeout(r, 100));
        const y = await page.evaluate(() => window.scrollY);
        still = y === last ? still + 1 : 0;
        last = y;
      }
      const top = await page.$eval(`#${id}`, (el) => el.getBoundingClientRect().top);
      if (Math.abs(top - 72) < 40 || (id === "home" && top >= 0 && top < 80) || (await page.evaluate(() => window.innerHeight + window.scrollY >= document.body.scrollHeight - 2))) navOk++;
      else console.log(`      #${id} ended at top=${top.toFixed(0)}px`);
    }
    check(navOk === info.navIds.length, `clicking each navigation link scrolls to its section (${navOk}/${info.navIds.length})`);

    // benchmark horizon tabs switch the chart
    await page.evaluate(() => document.querySelector(".tabs").scrollIntoView({ behavior: "instant", block: "center" }));
    const before = await page.$$eval(".tabs .tab", (t) => t.findIndex((x) => x.classList.contains("active")));
    await page.click(".tabs .tab:first-child");
    const after = await page.$$eval(".tabs .tab", (t) => t.findIndex((x) => x.classList.contains("active")));
    check(before === 2 && after === 0, "benchmark horizon tabs switch (60 min -> 15 min)");

    check(errors.length === 0, `no JavaScript errors${errors.length ? ": " + errors.slice(0, 3).join(" | ") : ""}`);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: join(SHOTS, `${name}-top.png`) });
    for (const id of ["certificate", "introduction", "part-a", "part-b", "results", "findings", "references"]) {
      await page.evaluate((i) => document.getElementById(i).scrollIntoView({ behavior: "instant" }), id);
      await new Promise((r) => setTimeout(r, 400));
      await page.screenshot({ path: join(SHOTS, `${name}-${id}.png`) });
    }
    await page.close();
  }

  if (process.argv.includes("--links")) {
    console.log("\n== reference links");
    const refs = JSON.parse(readFileSync(join(ROOT, "src", "data", "references.json"), "utf8"));
    for (const r of refs) {
      let status = "error";
      try {
        const res = await fetch(r.url, { method: "GET", redirect: "follow", headers: { "user-agent": "Mozilla/5.0 (link check)" } });
        status = res.status;
      } catch (e) { status = e.cause?.code || e.message; }
      console.log(`  [${r.n}] ${status}  ${r.url}`);
    }
  }
} finally {
  await browser.close();
  server.close();
}
console.log(failures.length ? `\n${failures.length} check(s) failed` : "\nall checks passed");
process.exit(failures.length ? 1 : 0);
