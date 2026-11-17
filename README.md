# Project website: Horizon-Specific Causal Graphs with False Discovery Rate Control for Multi-Horizon Traffic Forecasting

Website of the M.Tech dissertation of Sanjay Muraleedharan (Amrita School of Computing, Amrita Vishwa Vidyapeetham,
Coimbatore, November 2026). The content is taken from the thesis (`../HGP/thesis/hgp/thesis_full.tex`); every number in the
charts and tables is a value reported in the thesis.

## Run

Node.js 18 or newer.

```
npm install
npm run dev          # local development server, http://localhost:5173
npm run build        # static site in dist/ (open with any web server, or host on GitHub Pages)
npm run preview      # serve the built dist/ locally
```

The built site uses relative paths, so `dist/` can be hosted under any sub-path.

## Test

```
npm run build
npm run check                    # headless Edge / Chrome at desktop, tablet and phone widths
node tools/check.mjs --links     # also requests every reference URL
```

`tools/check.mjs` verifies that every navigation link reaches its section, all 7 diagrams, 9 charts, 12 equations and
3 thesis figures render, the 36 references are numbered 1–36 with links that open in a new tab, every in-text citation
points to a reference, the page never scrolls sideways, and there are no JavaScript errors. Screenshots are saved to
`tools/screenshots/`.

## Structure

```
src/
  data/project.js       title page, certificate, acknowledgement, abstract (thesis wording)
  data/results.js       all result tables of Chapters 3–4
  data/history.js       epoch history of the run behind thesis Figure 4.2
  data/references.json  the 36 references (generated, see below)
  data/diagrams.js      Mermaid definitions of the 7 diagrams
  data/equations.js     the equations of Chapter 3 (KaTeX)
  components/           FrontMatter (navbar, home, certificate, acknowledgement, abstract), Background (introduction,
                        objectives, literature), Methodology, Dataset, Results, Closing (findings, conclusion,
                        limitations, references, footer), common (section, equation, diagram, citation helpers)
public/figures/         figures copied from the thesis
tools/                  reference generator and browser test
```

## Updating the references

`src/data/references.json` is generated from the thesis bibliography, numbered in the order of first citation in the
thesis (IEEE style), with the same formatting as the thesis reference list:

```
python tools/build_references.py      # needs Python with pypandoc_binary
```

Libraries: React, Vite, Recharts (charts), Mermaid (diagrams), KaTeX (equations).
