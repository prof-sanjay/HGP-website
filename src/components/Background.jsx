import { Cite, M, Note, Section } from "./common";

/** Illustrative only: a queue at sensor S5 reaches upstream sensors later, so the useful sources depend on the horizon. */
function CongestionDiagram() {
  const sensors = [0, 1, 2, 3, 4];
  const rows = [
    { label: "now (t)", jam: [4] },
    { label: "t + 15 min", jam: [3, 4] },
    { label: "t + 30 min", jam: [2, 3, 4] },
    { label: "t + 60 min", jam: [0, 1, 2, 3, 4] },
  ];
  const x0 = 120, dx = 110, y0 = 46, dy = 56;
  return (
    <figure className="diagram">
      <div className="diagram-body">
        <svg viewBox="0 0 720 300" className="congestion-svg" role="img"
             aria-label="Illustration: a queue starting at sensor S5 spreads upstream to S4, S3, S2 and S1 over sixty minutes">
          <text x={x0 + 2 * dx} y={20} textAnchor="middle" className="svg-caption">traffic direction →</text>
          {rows.map((r, ri) => (
            <g key={r.label}>
              <text x={10} y={y0 + ri * dy + 5} className="svg-label">{r.label}</text>
              <line x1={x0 - 30} x2={x0 + 4 * dx + 30} y1={y0 + ri * dy} y2={y0 + ri * dy} className="svg-road" />
              {sensors.map((s) => {
                const jam = r.jam.includes(s);
                return (
                  <g key={s}>
                    <circle cx={x0 + s * dx} cy={y0 + ri * dy} r={13} className={jam ? "svg-node jam" : "svg-node"} />
                    <text x={x0 + s * dx} y={y0 + ri * dy + 4} textAnchor="middle" className={jam ? "svg-node-text jam" : "svg-node-text"}>
                      S{s + 1}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
          <g className="svg-legend">
            <circle cx={130} cy={282} r={7} className="svg-node jam" />
            <text x={142} y={286}>congested (slow)</text>
            <circle cx={300} cy={282} r={7} className="svg-node" />
            <text x={312} y={286}>free flow</text>
          </g>
        </svg>
      </div>
      <figcaption>
        <strong>Illustration.</strong> A queue forming at sensor S5 reaches the sensors upstream of it after a delay. To
        forecast S1 fifteen minutes ahead only nearby sensors matter; an hour ahead, sensors several kilometres away do.
        A single graph must serve both cases. (Schematic, not data.)
      </figcaption>
    </figure>
  );
}

export function Introduction() {
  return (
    <Section id="introduction" title="Introduction and Problem Statement" kicker="Chapter 1">
      <div className="prose">
        <h3>Graph-based traffic forecasting</h3>
        <p>
          A loop detector in a motorway lane reports, every five minutes, how many vehicles passed over it or how fast they
          were moving. Thousands of such detectors cover a metropolitan road network, and predicting what each of them will
          report fifteen, thirty or sixty minutes from now is the forecasting problem behind ramp metering, route guidance
          and congestion pricing. The problem is spatial as much as temporal: a queue forming at one interchange shows up at
          detectors several kilometres upstream after a delay, so the best prediction for one location draws on the recent
          history of many others. Models that treat the detectors as nodes of a graph and pass information along its edges
          have dominated this task for the better part of a decade.
        </p>
      </div>
      <CongestionDiagram />
      <div className="prose">
        <h3>The research gap</h3>
        <div className="two-col">
          <div className="card">
            <h4>Limitation 1 · one graph for every horizon</h4>
            <p>
              Graph WaveNet <Cite keys="wu2019graphwavenet" />, PDFormer <Cite keys="jiang2023pdformer" />, STAEformer{" "}
              <Cite keys="liu2023staeformer" /> and GC-MGT <Cite keys="wang2026gcmgt" /> each use one adjacency, learned or
              supplied, for every length of forecast. The same neighbourhood must serve a fifteen-minute prediction and a
              one-hour prediction, although a disturbance travels four times as far in the latter.
            </p>
          </div>
          <div className="card">
            <h4>Limitation 2 · no bound on spurious edges</h4>
            <p>
              Correlation thresholds, attention weights and pairwise Granger tests all yield edges, but none controls the
              proportion of false ones. On a network of thousands of sensors even a small per-pair error rate compounds
              into thousands of unsupported connections.
            </p>
          </div>
        </div>
        <h3>The proposed answer</h3>
        <p>
          The proposal, <strong>HGP</strong> (Horizon-specific Graph generation and Propagation), has two separable parts.
          <strong> Part A</strong> generates one directed graph per forecast horizon from the training data alone: a
          road-restricted vector autoregression (VAR) <Cite keys="sims1980" /> supplies directed effects at every horizon
          through its impulse responses, and a group knockoff filter <Cite keys="candes2018, dai2016group" /> decides,
          sensor by sensor, which candidate sources improve the <M>h</M>-step-ahead prediction, with the proportion of
          false edges controlled at a chosen level. <strong>Part B</strong> is a forecaster, HICP (Horizon-Indexed Causal
          Propagation), in which each horizon's prediction passes through a propagation step over that horizon's graph and
          a gate conditioned on a learned horizon embedding. The two parts meet only at the adjacency matrices.
        </p>
        <h3>Problem definition</h3>
        <p>
          Given five-minute measurements from <M>n</M> road sensors and the road adjacency: (1) for each horizon{" "}
          <M>{String.raw`h \in \{3, 6, 12\}`}</M> steps (15, 30, 60 minutes), construct a weighted directed graph{" "}
          <M>G_h</M> from training rows only, whose edges are sources that improve the <M>h</M>-step-ahead prediction of
          their targets, with the false discovery rate of the edge set controlled; (2) design a forecaster that produces all
          horizons in one forward pass, routing each horizon through its own graph, such that exchanging the graphs never
          changes the number of trainable parameters, so that any accuracy difference between graph configurations is
          attributable to the graphs alone. The design must include controls able to refute its central claim: that
          matching graphs to horizons helps beyond what a single well-chosen graph provides.
        </p>
        <Note>
          <strong>Outcome in one line.</strong> The knockoff-selected graphs help the forecaster, consistently but modestly
          (about 0.9% mean MAE). The horizon matching that gives the thesis its title does <em>not</em> add anything
          measurable beyond a single long-horizon graph. Both results are reported in the form the pre-registered design
          prescribed.
        </Note>
      </div>
    </Section>
  );
}

export function Objectives() {
  const contributions = [
    ["Horizon-specific directed graph generation",
      "One weighted, directed graph G_h per forecast horizon (15, 30, 60 min), built from training rows only. Edge (j → i) in G_h means: sensor j's present state helps predict sensor i h steps ahead."],
    ["Road-restricted VAR and impulse responses",
      "A ridge vector autoregression of order 3, each equation restricted to the sensor and the sensors within two road hops. Its impulse responses Ψ_h give the total effect of every source on every target after h steps, accumulated along all paths; they weight the edges of G_h."],
    ["Group knockoff filter with FDR control",
      "For each target and horizon, every candidate source group gets a synthetic 'knockoff' twin; a group is kept only if it beats its twin by a margin set so that the expected share of false edges stays below q = 0.3. Groups handle nearly collinear corridor sensors."],
    ["Horizon-Indexed Causal Propagation (HICP)",
      "A forecaster that encodes each sensor's history with a shared GRU and then, for each horizon, applies one directed propagation step over that horizon's graph, on the output side, with a separate head per horizon. All horizons come out of one forward pass."],
    ["Horizon-conditioned adaptive gating",
      "A softmax gate, conditioned on a learned horizon embedding, weighs the sensor's own encoding against the causal, road and similarity branches, per node and per horizon. The self logit is fixed at zero, so the gate can always fall back to the graph-free encoding."],
    ["Controlled evaluation of graph-to-horizon matching",
      "Every configuration (matched, single 60-min graph, single 15-min graph, deliberately shuffled, no graph) shares the architecture and the parameter count, and a decision rule was fixed before the decisive runs. Under that rule horizon matching was not shown to help."],
  ];
  return (
    <Section id="objectives" title="Research Objectives and Contributions" kicker="Chapters 1 and 2">
      <div className="prose">
        <h3>Objectives</h3>
        <p>The objectives were fixed before the decisive experiments were run and are stated here in that form.</p>
        <ul>
          <li>
            To select, for every sensor and horizon, a small set of source sensors from a two-hop candidate pool by group
            knockoff filtering on the <M>h</M>-step-ahead relation, with the false discovery rate of the selection
            controlled at level <M>q</M>, and to verify the control empirically under a constructed null.
          </li>
          <li>
            To assemble the selections into weighted directed graphs <M>{String.raw`G_3, G_6, G_{12}`}</M> and to establish,
            by explicit structural measures, whether the graphs differ across horizons by more than a rescaling.
          </li>
          <li>
            To design and implement HICP, a forecaster with per-node temporal encoding, one directed propagation step per
            horizon over that horizon's graph, a horizon-conditioned gate, and identical parameter counts across all graph
            configurations.
          </li>
        </ul>
        <h3>Questions the experiments answer</h3>
        <ol>
          <li>Does an FDR-controlled, conditionally selected graph serve a forecaster better than no graph, and than a graph of the same density chosen by effect size alone?</li>
          <li>Does giving each horizon its own graph improve on the best single graph, in particular the long-horizon graph used everywhere?</li>
          <li>Does any observed advantage survive scrutiny across random seeds under a decision rule fixed before the results were seen?</li>
        </ol>
      </div>
      <h3>Contributions</h3>
      <div className="grid-3">
        {contributions.map(([t, d], i) => (
          <div key={t} className="card">
            <p className="card-num">{i + 1}</p>
            <h4>{t}</h4>
            <p>{d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function Literature() {
  const items = [
    ["Graph neural networks for traffic", <>Models treat sensors as graph nodes and pass information along edges. T-GCN <Cite keys="zhao2019tgcn" /> combined a graph convolutional network with a GRU in a simple cell; STJGCN <Cite keys="zheng2024stjgcn" /> builds joint spatio-temporal graphs between adjacent time steps with dilated causal convolutions.</>],
    ["DCRNN", <>DCRNN <Cite keys="li2018dcrnn" /> modelled traffic as a diffusion process on the directed road graph inside an encoder–decoder recurrent network. It also introduced the PEMS-BAY benchmark used here.</>],
    ["STGCN", <>STGCN <Cite keys="yu2018stgcn" /> combined graph convolutions with temporal convolutions; its published PEMS-BAY errors appear in the benchmark comparison.</>],
    ["Graph WaveNet", <>Graph WaveNet <Cite keys="wu2019graphwavenet" /> paired dilated temporal convolutions with graph convolutions and introduced a learned "adaptive" adjacency to patch the deficiencies of the fixed road graph.</>],
    ["PDFormer", <>PDFormer <Cite keys="jiang2023pdformer" /> models propagation delay explicitly with a transformer whose attention is masked by geographic and semantic neighbourhoods.</>],
    ["STAEformer", <>STAEformer <Cite keys="liu2023staeformer" /> removed the graph altogether: a plain transformer with learned spatio-temporal embeddings matched or beat the graph models and remains the strongest widely reproduced result on PEMS-BAY.</>],
    ["Knockoff filters and FDR control", <>The knockoff filter of Barber and Candès <Cite keys="barber2015" />, extended to the model-X setting by Candès et al. <Cite keys="candes2018" />, keeps only variables that beat synthetic twins, with a finite-sample bound on the expected share of false selections. Group knockoffs <Cite keys="dai2016group" /> handle clusters of collinear variables; Chi et al. <Cite keys="chi2025tski" /> analyse knockoffs for time series.</>],
  ];
  return (
    <Section id="literature" title="Literature Survey" kicker="Chapter 2">
      <div className="grid-2">
        {items.map(([t, d]) => (
          <div key={t} className="card">
            <h4>{t}</h4>
            <p>{d}</p>
          </div>
        ))}
      </div>
      <div className="prose">
        <h3>How recent models treat the horizon</h3>
        <p>
          Ten recent multi-horizon papers were examined for where the horizon enters the architecture. STJGCN{" "}
          <Cite keys="zheng2024stjgcn" /> gives each output step its own module; an industrial process forecaster{" "}
          <Cite keys="zhu2026industrial" /> indexes decoder queries by horizon; a residual-adaptation model{" "}
          <Cite keys="zhang2026msifa" /> applies per-horizon corrections; an air-quality forecaster <Cite keys="li2026aqi" />{" "}
          finds that its graph branch matters more at longer leads, yet keeps one graph. Dynamic-graph models{" "}
          <Cite keys="pan2026dstfgcn, zhu2026dynamic" /> vary the graph over <em>input</em> windows, which is orthogonal to
          varying it over <em>output</em> horizons. Across all ten, the horizon conditions heads, queries, gates or
          corrections, and never the graph.
        </p>
        <h3>Research gap that motivates HGP</h3>
        <p>
          Graphs in traffic forecasting are built from geometry, learned end-to-end, or derived from statistical tests
          without conditional error control; the forecast horizon conditions nearly every part of recent architectures
          except the graph. No published traffic forecaster, as far as the author could determine, builds a separate,
          FDR-controlled graph per forecast horizon and routes each horizon's prediction through its own graph.
        </p>
        <Note>
          Published numbers on PEMS-BAY are comparable only under the same protocol (7:1:2 chronological split, one-hour
          input, zero readings masked, errors at 15/30/60 min). Recent papers depart from these conventions often enough
          that the same baseline is reported with different numbers from paper to paper.
        </Note>
      </div>
    </Section>
  );
}
