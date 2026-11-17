"""
Build src/data/references.json from the thesis bibliography, numbered exactly as in the thesis.

IEEE numbering = order of first citation in thesis_full.tex (\cite and \nocite), as IEEEtran.bst numbers it.
Formatting: pandoc citeproc with the IEEE CSL style; venue names copied verbatim from the .bib; article numbers
("Art. no.") placed where the IEEE style prints them; each entry carries the url field of the .bib.

    python tools/build_references.py
"""
import json
import re
import subprocess
from html import unescape
from pathlib import Path

import pypandoc

ROOT = Path(__file__).resolve().parents[1]
THESIS = ROOT.parent / "HGP" / "thesis"
TEX, BIB, CSL = THESIS / "hgp" / "thesis_full.tex", THESIS / "hgp" / "thesis_refer.bib", THESIS / "word_build" / "ieee.csl"
PANDOC = pypandoc.get_pandoc_path()

tex = re.sub(r"(?m)(?<!\\)%.*$", "", TEX.read_text(encoding="utf8"))
order = []
for m in re.finditer(r"\\(?:no)?cite[tp]?\{([^}]*)\}", tex):
    for k in m.group(1).split(","):
        k = k.strip()
        if k and k != "*" and k not in order:
            order.append(k)

bib = BIB.read_text(encoding="utf8")
fields = {}
for m in re.finditer(r"@\w+\{([^,]+),(.*?)\n\}", bib, flags=re.S):
    f = dict((k.lower(), v) for k, v in re.findall(r"\n\s*(\w+)\s*=\s*\{(.*)\},?\s*(?=\n)", m.group(2) + "\n"))
    fields[m.group(1).strip()] = f

csl = json.loads(subprocess.run([PANDOC, str(BIB), "-f", "bibtex", "-t", "csljson"], capture_output=True, check=True).stdout)
for e in csl:
    f = fields.get(e["id"], {})
    venue = f.get("journal") or f.get("booktitle")
    if venue:
        e["container-title"] = re.sub(r"[{}]", "", venue).replace("\\&", "&")
    m = re.search(r"Art\. no\. (\S+)", e.get("note", ""))
    if m:
        e["number"] = m.group(1)
        if e["note"].startswith("Part B"):
            e["volume"] = e["volume"] + ", Part B"
        del e["note"]
    if e.get("type") == "paper-conference" and e.get("volume"):
        e["container-title"] += ", vol. " + e.pop("volume")
    e.pop("URL", None)                                   # the link is shown separately on the page
tmp = ROOT / "tools" / "_refs.json"
tmp.write_text(json.dumps(csl, ensure_ascii=False), encoding="utf8")

md = "".join(f"[@{k}] " for k in order) + "\n\n::: {#refs}\n:::\n"
html = subprocess.run([PANDOC, "-f", "markdown", "-t", "html", "--citeproc", "--bibliography", str(tmp), "--csl", str(CSL),
                       "--wrap=none"], input=md.encode("utf8"), capture_output=True, check=True).stdout.decode("utf8")
tmp.unlink()

refs = []
for m in re.finditer(r'<div id="ref-([^"]+)" class="csl-entry"[^>]*>\s*<div class="csl-left-margin">\[(\d+)\]\s*</div><div\s+class="csl-right-inline">(.*?)</div>\s*</div>',
                     html, flags=re.S):
    key, num, body = m.group(1), int(m.group(2)), m.group(3).strip()
    url = fields[key].get("url")
    refs.append({"n": num, "key": key, "html": body, "url": url})

refs.sort(key=lambda r: r["n"])
assert [r["n"] for r in refs] == list(range(1, len(order) + 1)), [r["n"] for r in refs]
assert [r["key"] for r in refs] == order, "numbering differs from the thesis citation order"
out = ROOT / "src" / "data" / "references.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(refs, ensure_ascii=False, indent=1), encoding="utf8")
print(len(refs), "references;", sum(1 for r in refs if r["url"]), "with links ->", out)
