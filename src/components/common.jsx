import { useEffect, useId, useRef, useState } from "react";
import katex from "katex";
import references from "../data/references.json";

const refNumber = Object.fromEntries(references.map((r) => [r.key, r.n]));

export function Section({ id, title, kicker, children }) {
  return (
    <section id={id} className="section">
      <div className="container">
        {kicker && <p className="kicker">{kicker}</p>}
        <h2>{title}</h2>
        {children}
      </div>
    </section>
  );
}

/** Display equation with its thesis number, e.g. <Equation tex={...} number="3.1" />. */
export function Equation({ tex, number, label }) {
  const html = katex.renderToString(tex, { displayMode: true, throwOnError: true, strict: "ignore" });
  return (
    <figure className="equation" aria-label={label || `Equation ${number}`}>
      <div className="equation-body" dangerouslySetInnerHTML={{ __html: html }} />
      {number && <span className="equation-number">({number})</span>}
    </figure>
  );
}

/** Inline math. */
export function M({ children }) {
  const html = katex.renderToString(children, { displayMode: false, throwOnError: true, strict: "ignore" });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Numbered citation(s) linking to the reference list, e.g. <Cite keys="wu2019graphwavenet" />. */
export function Cite({ keys }) {
  const list = keys.split(",").map((k) => k.trim());
  return (
    <span className="cite">
      [
      {list.map((k, i) => {
        const n = refNumber[k];
        if (!n) throw new Error(`unknown reference key ${k}`);
        return (
          <span key={k}>
            {i > 0 && ", "}
            <a href={`#ref-${n}`}>{n}</a>
          </span>
        );
      })}
      ]
    </span>
  );
}

let mermaidPromise;
let renderCount = 0;
function loadMermaid() {
  if (!mermaidPromise) {
    // Mermaid sizes its boxes by measuring text, so the web font must be loaded first or labels get clipped.
    const fontsReady = typeof document !== "undefined" && document.fonts ? document.fonts.ready : Promise.resolve();
    mermaidPromise = Promise.all([import("mermaid"), fontsReady]).then(([{ default: mermaid }]) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        fontFamily: "Inter, Arial, sans-serif",
        flowchart: { htmlLabels: true, curve: "basis", useMaxWidth: true },
        themeVariables: {
          primaryColor: "#eef3fa",
          primaryBorderColor: "#2b5c9e",
          primaryTextColor: "#1b2733",
          lineColor: "#5b6b7c",
          clusterBkg: "#f7f9fc",
          clusterBorder: "#c4d1e2",
          fontSize: "14px",
        },
      });
      return mermaid;
    });
  }
  return mermaidPromise;
}

/** A Mermaid diagram with a numbered caption. */
export function Diagram({ code, caption, number }) {
  const id = "mmd" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    loadMermaid()
      .then((mermaid) => mermaid.render(`${id}-${++renderCount}`, code))
      .then(({ svg }) => alive && setSvg(svg))
      .catch((e) => alive && setError(String(e.message || e)));
    return () => {
      alive = false;
    };
  }, [code, id]);
  return (
    <figure className="diagram">
      <div className="diagram-body" role="img" aria-label={caption}>
        {svg ? <div dangerouslySetInnerHTML={{ __html: svg }} /> : error ? <pre className="diagram-error">{error}</pre> : <p className="muted">Loading diagram…</p>}
      </div>
      <figcaption>
        <strong>Diagram {number}.</strong> {caption}
      </figcaption>
    </figure>
  );
}

/** A figure image taken from the thesis. */
export function ThesisFigure({ src, alt, caption, label, width, height }) {
  return (
    <figure className="thesis-figure">
      <img src={src} alt={alt} loading="lazy" width={width} height={height} />
      <figcaption>
        <strong>{label}.</strong> {caption}
      </figcaption>
    </figure>
  );
}

export function Note({ children, tone = "info" }) {
  return <aside className={`note note-${tone}`}>{children}</aside>;
}

/** Small helper: format a number with a fixed number of decimals. */
export const fmt = (v, d = 3) => (typeof v === "number" ? v.toFixed(d) : v);

/** Keeps the latest value of a media query (for chart layouts on small screens). */
export function useMedia(query) {
  const get = () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false);
  const [match, setMatch] = useState(get);
  const ref = useRef(query);
  useEffect(() => {
    const m = window.matchMedia(ref.current);
    const on = () => setMatch(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return match;
}
