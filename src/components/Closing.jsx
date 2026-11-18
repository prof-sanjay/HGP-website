import references from "../data/references.json";
import { project } from "../data/project";
import { Cite, Note, Section } from "./common";

export function Findings() {
  const supported = [
    ["The three graphs are structurally different.", "The 15- and 60-minute graphs share 46% of their union and their shared edge weights correlate at only 0.59; neighbouring horizons agree more closely (62% / 0.79 and 58% / 0.87)."],
    ["Knockoff-selected graphs lower the forecasting error.", "About 0.9% in mean MAE (1.675 against 1.690 without a causal graph) and 0.9% in mean RMSE, with the road and similarity branches present."],
    ["The gain is largest at the 60-minute horizon.", "0.007 mph at 15 minutes, 0.014 at 30 and 0.022 at 60."],
    ["Edge selection matters less than expected.", "A graph of the same density chosen by impulse-response size alone, sharing only 38–39% of its edges with the knockoff graph, reaches practically the same error (1.680). The knockoff step contributes error control rather than accuracy."],
    ["Consistent edge weighting matters.", "Giving every edge an impulse-response weight (two-hop VAR support) instead of a mixed weighting rule lowers mean MAE by 0.004 and mean RMSE by 0.008: the largest change within Part A, on one seed."],
    ["HICP is competitive with the evaluated models.", "At 100 epochs it is ahead of the published ARIMA, FC-LSTM, WaveNet, DCRNN and STGCN errors at every horizon, within about 2% of Graph WaveNet in MAE and ahead of it at 60 minutes in RMSE (published values, indicative)."],
  ];
  return (
    <Section id="findings" title="Findings and Discussion" kicker="Chapter 4 · Inferences">
      <h3>Supported by the evidence</h3>
      <div className="grid-2">
        {supported.map(([t, d]) => (
          <div key={t} className="card finding ok">
            <h4>{t}</h4>
            <p>{d}</p>
          </div>
        ))}
      </div>
      <h3>Not supported: the central hypothesis</h3>
      <div className="card finding no">
        <h4>Horizon-specific graph matching does not measurably improve over a single long-reach graph.</h4>
        <p>
          Once the VAR support is held fixed, the 60-minute graph used everywhere (g12_all), the 15-minute graph used
          everywhere (g3_all) and a deliberately mismatched assignment (Shuffled) all land within the 0.002 mph seed-to-seed
          spread of the proposed configuration. Under the decision rule fixed in advance, the verdict is that long-reach graph
          generation helps and horizon matching does not add to it.
        </p>
      </div>
      <div className="prose">
        <h3>Why the matching might not pay</h3>
        <p>
          Two explanations are consistent with the data and the experiment cannot separate them. First, the GRU encoding,
          which sees twelve steps of each sensor's own history, may already carry the timing information that distinguishes
          a 15-minute from a 60-minute source, so any graph with adequate reach suffices. Second, the range from 15 to 60
          minutes may be too narrow on a freeway network with sensors a few kilometres apart for the relevant source sets to
          differ in a way that matters: the graphs do differ, but even between the extreme horizons the shared edges correlate
          at 0.59. Widening the horizon range or shortening the input window would test either explanation.
        </p>
      </div>
    </Section>
  );
}

export function Conclusion() {
  return (
    <Section id="conclusion" title="Conclusion" kicker="Chapter 5">
      <div className="prose">
        <p>
          This thesis set out from a gap that is easy to state: traffic forecasters condition nearly everything on the
          forecast horizon except the one component, the graph, that governs how far information travels. It built a complete
          method for closing that gap and the instruments for judging whether closing it matters, and then applied those
          instruments without adjusting them to the result.
        </p>
        <p>
          <strong>Part A.</strong> Knockoff-based selection with false discovery rate control, previously absent from traffic
          graph construction, produces horizon-specific graphs that are sparse, directed, provenance-checked and structurally
          distinct across horizons: a different graph for a different reach.
        </p>
        <p>
          <strong>HICP.</strong> The forecaster put the graphs, and only the graphs, on trial. The knockoff-selected graph lowers
          the error at every horizon, modestly, by about 0.9% in mean absolute error with the road graph and a learned
          similarity graph present, and most at sixty minutes.
        </p>
        <p>
          <strong>Horizon matching.</strong> Under a decision rule fixed before any decisive run, horizon matching adds
          nothing measurable: the sixty-minute graph used everywhere, the fifteen-minute graph used everywhere and a
          deliberately wrong assignment all match the proposed configuration to the third decimal place.
        </p>
        <p>
          <strong>Graph weighting.</strong> A control graph chosen by effect size alone, sharing fewer than half its edges with
          the knockoff graph, matches it, while giving every edge an impulse-response weight is the one change within Part A
          that moves the error. The forecaster is sensitive to being given a graph of adequate reach, density and consistent
          weighting, and insensitive to almost everything else about it.
        </p>
        <p>
          <strong>Overall.</strong> Trained to its full schedule, the model is ahead of the published errors of DCRNN, STGCN,
          WaveNet and FC-LSTM at every horizon, within about 2% of Graph WaveNet in mean absolute error and ahead of it at
          sixty minutes in root mean squared error, with the training length itself worth more than any graph choice. The
          negative outcome is reported with the same care as a positive one would have been.
        </p>
      </div>
    </Section>
  );
}

export function Limitations() {
  return (
    <Section id="limitations" title="Limitations and Future Enhancements" kicker="Chapter 5">
      <div className="two-col">
        <div>
          <h3>Limitations</h3>
          <ul>
            <li>The evaluation covers one dataset, PEMS-BAY, with 325 speed sensors over six months, so the conclusions about horizon matching are established on a small freeway network and may not hold on a larger or denser one.</li>
            <li>Selected edges are predictive, Granger-type relations, and are not claimed to be structural causation; interventional validity is outside the scope of the evidence.</li>
            <li>The candidate pool is limited to two road hops, so a genuine long-range dependence bypassing the road network cannot be discovered.</li>
            <li>The comparison with other models rests on a per-sensor LSTM run on a single seed and on published values quoted from one paper, not on re-runs under this work's protocol; the stronger transformer-based forecasters of recent years were not run within the project's compute allowance.</li>
          </ul>
        </div>
        <div>
          <h3>Future enhancements</h3>
          <ul>
            <li>Evaluate on the Greater Bay Area subset of LargeST <Cite keys="liu2023largest" /> (over two thousand sensors, a full year), with empirical FDR checks by placebo and semi-synthetic tests.</li>
            <li>Shorten the input history window, to test whether the temporal encoder is why the graph's horizon information goes unused.</li>
            <li>Compare on the same split and protocol with PDFormer <Cite keys="jiang2023pdformer" />, STAEformer <Cite keys="liu2023staeformer" /> and the Granger-causality-guided multi-graph transformer <Cite keys="wang2026gcmgt" />, including the knockoff graph as an attention bias in STAEformer.</li>
            <li>An input-dependent semantic graph.</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

export function References() {
  return (
    <Section id="references" title="References" kicker={`${references.length} references, numbered as in the thesis`}>
      <ol className="references">
        {references.map((r) => (
          <li key={r.n} id={`ref-${r.n}`}>
            <span className="ref-num">[{r.n}]</span>
            <span className="ref-body">
              <span dangerouslySetInnerHTML={{ __html: r.html }} />{" "}
              {r.url && (
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="ref-link">
                  {r.url.replace(/^https?:\/\//, "")}
                </a>
              )}
            </span>
          </li>
        ))}
      </ol>
      <Note>References [25]–[36] are listed in the thesis bibliography without being cited in its text.</Note>
    </Section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <p className="footer-name">{project.student}</p>
          <p>{project.degreeShort} – {project.department}</p>
          <p>{project.school}</p>
          <p>{project.university}, Coimbatore</p>
        </div>
        <div>
          <p className="footer-title">{project.title}</p>
          <p>M.Tech Dissertation (Phase I) · {project.year}</p>
          <p>Thesis advisor: {project.advisor}</p>
          <p>Source code: <a href={project.code} target="_blank" rel="noopener noreferrer">github.com/prof-sanjay/HGP</a></p>
          <p><a href="#home">Back to top</a></p>
        </div>
      </div>
    </footer>
  );
}
