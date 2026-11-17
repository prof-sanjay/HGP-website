import { useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { history } from "../data/history";
import { ablation, benchmark, configResults, edgeCounts, overlap, seeds, varSupport } from "../data/results";
import { Cite, fmt, Note, Section, ThesisFigure, useMedia } from "./common";

const ACCENT = "#2b5c9e";
const CONFIG_COLORS = { Proposed: "#1f4e8c", g12_all: "#5b8fd0", g3_all: "#9ab8de", Shuffled: "#c9a24a", None: "#8a939c" };
const AXIS = { fontSize: 12, fill: "#3d4a57" };

function ChartCard({ title, children, note, height = 300 }) {
  return (
    <figure className="chart-card">
      <figcaption className="chart-title">{title}</figcaption>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
      {note && <p className="chart-note">{note}</p>}
    </figure>
  );
}

const tooltipStyle = { contentStyle: { borderRadius: 6, borderColor: "#c4d1e2", fontSize: 13 } };

export function Results() {
  const narrow = useMedia("(max-width: 640px)");
  const [h, setH] = useState(2);                       // benchmark horizon index: 0 = 15, 1 = 30, 2 = 60 min
  const horizonLabels = ["15 min", "30 min", "60 min"];
  const configByHorizon = horizonLabels.map((label, k) => ({
    horizon: label,
    ...Object.fromEntries(configResults.map((c) => [c.name, [c.h15, c.h30, c.h60][k]])),
  }));
  const benchData = benchmark.map((b) => ({ model: b.model, source: b.source, mae: b.mae[h], rmse: b.rmse[h],
    label: b.mae[h].toFixed(b.source === "published" ? 2 : 3) }));
  const ablationData = ablation.map((a) => ({ name: a.name, mae: a.mae, rmse: a.rmse }));

  return (
    <Section id="results" title="Results and Visualisations" kicker="Chapter 4">
      <p>
        All values are PEMS-BAY test-split errors of the full model (hidden size 128, road and similarity branches on,
        327,483 parameters), seed 42 unless stated. MAE and RMSE are in mph, MAPE in per cent; lower is better.
      </p>

      {/* A, B: graph properties */}
      <h3>A · Properties of the generated graphs</h3>
      <div className="grid-2">
        <ChartCard title="Edges per graph" note="Directed edges selected at FDR level q = 0.3 (thesis Section 4.1).">
          <BarChart data={edgeCounts} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" vertical={false} />
            <XAxis dataKey="graph" tick={AXIS} />
            <YAxis tick={AXIS} domain={[0, 3500]} ticks={[0, 1000, 2000, 3000]} label={{ value: "Edges", angle: -90, position: "insideLeft", style: AXIS }} />
            <Tooltip {...tooltipStyle} formatter={(v) => [v.toLocaleString("en-US"), "edges"]} />
            <Bar dataKey="edges" fill={ACCENT} radius={[4, 4, 0, 0]} maxBarSize={70}>
              <LabelList dataKey="edges" position="top" formatter={(v) => v.toLocaleString("en-US")} style={AXIS} />
            </Bar>
          </BarChart>
        </ChartCard>
        <ChartCard title="Shared edges across horizons (% of union)" note="Shared edges are present in both graphs; the union counts each edge once.">
          <BarChart data={overlap} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" vertical={false} />
            <XAxis dataKey="comparison" tick={AXIS} />
            <YAxis tick={AXIS} domain={[0, 100]} unit="%" />
            <Tooltip {...tooltipStyle} formatter={(v, n, p) => [`${v}% (${p.payload.shared.toLocaleString("en-US")} edges)`, "shared"]} />
            <Bar dataKey="pct" fill={ACCENT} radius={[4, 4, 0, 0]} maxBarSize={70}>
              <LabelList dataKey="pct" position="top" formatter={(v) => `${v}%`} style={AXIS} />
            </Bar>
          </BarChart>
        </ChartCard>
      </div>
      <div className="grid-2">
        <ChartCard title="Rank correlation of shared edge weights" height={260}>
          <BarChart data={overlap} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" vertical={false} />
            <XAxis dataKey="comparison" tick={AXIS} />
            <YAxis tick={AXIS} domain={[0, 1]} />
            <Tooltip {...tooltipStyle} formatter={(v) => [v.toFixed(2), "rank correlation"]} />
            <Bar dataKey="rank" fill="#5b8fd0" radius={[4, 4, 0, 0]} maxBarSize={70}>
              <LabelList dataKey="rank" position="top" formatter={(v) => v.toFixed(2)} style={AXIS} />
            </Bar>
          </BarChart>
        </ChartCard>
        <div className="table-wrap">
          <table>
            <caption>Edge inclusion across horizons (thesis Table 4.1)</caption>
            <thead><tr><th>Comparison</th><th className="num">Shared edges</th><th className="num">Shared (% of union)</th><th className="num">Rank correlation</th></tr></thead>
            <tbody>
              {overlap.map((o) => (
                <tr key={o.comparison}><td>{o.comparison}</td><td className="num">{o.shared.toLocaleString("en-US")}</td><td className="num">{o.pct}%</td><td className="num">{o.rank.toFixed(2)}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="small">
            Neighbouring horizons agree closely and distant ones do not: the 15- and 60-minute graphs share only 46% of their
            union, and on shared edges their weights correlate at 0.59. The graphs differ across horizons in both membership
            and strength, and the difference grows with the gap between horizons.
          </p>
        </div>
      </div>
      <ThesisFigure
        src="figures/fig_edge_weight_scatter_log.png"
        width={2398}
        height={854}
        alt="Scatter plots of shared edge weights between pairs of horizons on logarithmic axes"
        label="Thesis Figure 4.1"
        caption="Weight of each shared edge in one graph against its weight in the other, for the three pairs of horizons (logarithmic axes; dashed line = equal weights)."
      />

      {/* C: configurations */}
      <h3>B · Graph configurations and the central hypothesis</h3>
      <ChartCard
        title="Test MAE by configuration and horizon"
        height={narrow ? 340 : 360}
        note="The vertical axis starts at 1.2 mph so that differences of a few thousandths of a mph are visible; the full values are in the table below."
      >
        <BarChart data={configByHorizon} margin={{ top: 10, right: 10, left: 4, bottom: 5 }} barCategoryGap="18%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" vertical={false} />
          <XAxis dataKey="horizon" tick={AXIS} />
          <YAxis tick={AXIS} domain={[1.2, 2.1]} ticks={[1.2, 1.4, 1.6, 1.8, 2.0]} allowDataOverflow
                 label={{ value: "MAE (mph)", angle: -90, position: "insideLeft", style: AXIS }} />
          <Tooltip {...tooltipStyle} formatter={(v, n) => [v.toFixed(3) + " mph", n]} />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          {configResults.map((c) => (
            <Bar key={c.name} dataKey={c.name} fill={CONFIG_COLORS[c.name]} radius={[3, 3, 0, 0]} />
          ))}
        </BarChart>
      </ChartCard>
      <div className="table-wrap">
        <table>
          <caption>Graph configurations under the full model, seed 42 (thesis Table 4.2)</caption>
          <thead>
            <tr><th>Configuration</th><th>Graph at 15 / 30 / 60 min</th><th className="num">MAE 15</th><th className="num">MAE 30</th><th className="num">MAE 60</th><th className="num">Mean MAE</th><th className="num">Mean RMSE</th><th className="num">Mean MAPE</th></tr>
          </thead>
          <tbody>
            {configResults.map((c) => (
              <tr key={c.name} className={c.name === "Proposed" ? "highlight" : ""}>
                <td>{c.name}</td><td>{c.graphs}</td>
                <td className="num">{fmt(c.h15)}</td><td className="num">{fmt(c.h30)}</td><td className="num">{fmt(c.h60)}</td>
                <td className="num">{fmt(c.mae)}</td><td className="num">{fmt(c.rmse)}</td><td className="num">{fmt(c.mape)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="prose">
        <p>
          Three of the four graph configurations land on the same mean MAE, 1.680, and the proposed configuration is 0.005
          ahead of them; the model without a causal graph is a further 0.010 behind. The proposed configuration leads
          g12_all by 0.004, 0.004 and 0.006 mph, but moving from the one-hop to the two-hop VAR support alone, with the same
          edges, accounts for 0.003, 0.005 and 0.004 of that (Table D below). Once that is taken out, the proposed configuration
          sits within 0.002 of g12_all at every horizon, which is also the spread between seeds. The pre-registered condition
          is not met.
        </p>
        <Note tone="verdict">
          <strong>Verdict under the decision rule:</strong> long-reach graph generation helps; horizon matching does not add
          to it. A deliberately mismatched assignment (Shuffled) costs only 0.002 mph at 60 minutes, while every graph
          configuration beats None at every horizon, by 0.014–0.022 mph at 60 minutes.
        </Note>
        <p className="small">
          The proposed row uses the two-hop VAR support adopted in the thesis; the four control rows were run with the
          earlier one-hop support, as the thesis states.
        </p>
      </div>

      {/* D: ablation */}
      <h3>C · Ablation of Part A</h3>
      <div className="grid-2">
        <ChartCard title="Mean MAE over the three horizons" height={280} note="Axis starts at 1.66 mph.">
          <BarChart data={ablationData} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" horizontal={false} />
            <XAxis type="number" tick={AXIS} domain={[1.66, 1.695]} ticks={[1.66, 1.67, 1.68, 1.69]} allowDataOverflow />
            <YAxis type="category" dataKey="name" tick={AXIS} width={narrow ? 110 : 170} />
            <Tooltip {...tooltipStyle} formatter={(v) => [v.toFixed(3) + " mph", "mean MAE"]} />
            <Bar dataKey="mae" radius={[0, 4, 4, 0]} maxBarSize={36}>
              {ablationData.map((a) => <Cell key={a.name} fill={a.name === "Proposed" ? "#1f4e8c" : "#9ab8de"} />)}
              <LabelList dataKey="mae" position="right" formatter={(v) => v.toFixed(3)} style={AXIS} />
            </Bar>
          </BarChart>
        </ChartCard>
        <ChartCard title="Mean RMSE over the three horizons" height={280} note="Axis starts at 3.66 mph.">
          <BarChart data={ablationData} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" horizontal={false} />
            <XAxis type="number" tick={AXIS} domain={[3.66, 3.72]} ticks={[3.66, 3.68, 3.70, 3.72]} allowDataOverflow />
            <YAxis type="category" dataKey="name" tick={AXIS} width={narrow ? 110 : 170} />
            <Tooltip {...tooltipStyle} formatter={(v) => [v.toFixed(3) + " mph", "mean RMSE"]} />
            <Bar dataKey="rmse" radius={[0, 4, 4, 0]} maxBarSize={36}>
              {ablationData.map((a) => <Cell key={a.name} fill={a.name === "Proposed" ? "#1f4e8c" : "#9ab8de"} />)}
              <LabelList dataKey="rmse" position="right" formatter={(v) => v.toFixed(3)} style={AXIS} />
            </Bar>
          </BarChart>
        </ChartCard>
      </div>
      <div className="table-wrap">
        <table>
          <caption>Part A ablation, seed 42 (thesis Table 4.3)</caption>
          <thead><tr><th>Configuration</th><th>What is changed</th><th className="num">MAE 15</th><th className="num">MAE 30</th><th className="num">MAE 60</th><th className="num">Mean MAE</th><th className="num">Mean RMSE</th><th className="num">Mean MAPE</th></tr></thead>
          <tbody>
            {ablation.map((a) => (
              <tr key={a.name} className={a.name === "Proposed" ? "highlight" : ""}>
                <td>{a.name}</td><td>{a.change}</td><td className="num">{fmt(a.h15)}</td><td className="num">{fmt(a.h30)}</td><td className="num">{fmt(a.h60)}</td>
                <td className="num">{fmt(a.mae)}</td><td className="num">{fmt(a.rmse)}</td><td className="num">{fmt(a.mape)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="prose">
        <p>
          Removing Part A costs 0.9% of mean MAE (1.690 against 1.675) and 0.9% of mean RMSE, and the loss grows with the
          horizon: 0.007 mph at 15 minutes, 0.014 at 30 and 0.022 at 60. Removing only the knockoff selection, so that each
          target takes the same number of sources by impulse-response size, gives 1.680. That graph shares only 38–39% of its
          edges with the knockoff graph, yet reaches the error of the one-hop knockoff graph (1.679). The forecaster is
          insensitive to which particular sources it is given within the pool; what the knockoff step contributes is not
          accuracy but a bound on the expected share of spurious edges.
        </p>
      </div>
      <div className="table-wrap">
        <table>
          <caption>D · VAR support: one road hop against the two-hop pool, same selected edges (thesis Table 4.4)</caption>
          <thead><tr><th>VAR support</th><th className="num">MAE 15</th><th className="num">MAE 30</th><th className="num">MAE 60</th><th className="num">Mean MAE</th><th className="num">Mean RMSE</th></tr></thead>
          <tbody>
            {varSupport.map((v) => (
              <tr key={v.name} className={v.name.startsWith("Two-hop") ? "highlight" : ""}>
                <td>{v.name}</td><td className="num">{fmt(v.h15)}</td><td className="num">{fmt(v.h30)}</td><td className="num">{fmt(v.h60)}</td><td className="num">{fmt(v.mae)}</td><td className="num">{fmt(v.rmse)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="small">
          Giving every edge an impulse-response weight (two-hop support) instead of a mixed weighting rule lowers the mean MAE
          by 0.004 and the mean RMSE by 0.008, the largest effect of any change within Part A. It is measured on one seed and
          is of the order of the run-to-run spread.
        </p>
      </div>

      {/* seeds + training */}
      <h3>E · The proposed configuration over three seeds and its training</h3>
      <div className="grid-2">
        <div className="table-wrap">
          <table>
            <caption>Proposed configuration, test MAE over seeds (thesis Table 4.5)</caption>
            <thead><tr><th>Seed</th><th className="num">MAE 15</th><th className="num">MAE 30</th><th className="num">MAE 60</th></tr></thead>
            <tbody>
              {seeds.map((s) => (
                <tr key={s.seed}><td>{s.seed}</td><td className="num">{fmt(s.h15)}</td><td className="num">{fmt(s.h30)}</td><td className="num">{fmt(s.h60)}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="small">
            Seeds 7 and 123 agree to the third decimal at 15 minutes and differ by 0.002 at 30 and 60 minutes. This 0.002 is
            the resolution of the experiment. Seed 42 uses the two-hop VAR support; seeds 7 and 123 the earlier one-hop
            support.
          </p>
        </div>
        <div>
          <ChartCard title="Training loss per epoch (seed 42)" height={220} note="Masked MAE objective in normalised units.">
            <LineChart data={history} margin={{ top: 10, right: 16, left: 0, bottom: 14 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" />
              <XAxis dataKey="epoch" tick={AXIS} label={{ value: "Epoch", position: "insideBottom", offset: -8, style: AXIS }} />
              <YAxis tick={AXIS} domain={[0.2, 0.34]} />
              <Tooltip {...tooltipStyle} formatter={(v) => [v.toFixed(4), "training loss"]} labelFormatter={(l) => `Epoch ${l}`} />
              <Line type="monotone" dataKey="trainLoss" stroke={ACCENT} strokeWidth={2} dot={false} />
            </LineChart>
          </ChartCard>
        </div>
      </div>
      <ChartCard title="Validation MAE per epoch (seed 42), averaged over the three horizons" height={260}
                 note="Exact values of the run behind thesis Figure 4.2. The best epoch is the last one (40, 1.734 mph): the error was still falling by about 0.001 per epoch when the 40-epoch budget ended.">
        <LineChart data={history} margin={{ top: 10, right: 16, left: 0, bottom: 14 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" />
          <XAxis dataKey="epoch" tick={AXIS} label={{ value: "Epoch", position: "insideBottom", offset: -8, style: AXIS }} />
          <YAxis tick={AXIS} domain={[1.7, 2.2]} label={{ value: "MAE (mph)", angle: -90, position: "insideLeft", style: AXIS }} />
          <Tooltip {...tooltipStyle} formatter={(v) => [v.toFixed(4) + " mph", "validation MAE"]} labelFormatter={(l) => `Epoch ${l}`} />
          <Line type="monotone" dataKey="valMae" stroke="#c9a24a" strokeWidth={2} dot={{ r: 2 }} />
        </LineChart>
      </ChartCard>

      {/* benchmark */}
      <h3>F · Comparison with published models and a per-sensor LSTM</h3>
      <div className="tabs" role="tablist" aria-label="Forecast horizon">
        {horizonLabels.map((l, k) => (
          <button key={l} role="tab" aria-selected={h === k} className={h === k ? "tab active" : "tab"} onClick={() => setH(k)}>{l}</button>
        ))}
      </div>
      <ChartCard title={`Test MAE at ${horizonLabels[h]}: published values (grey) and runs of this thesis (blue)`} height={narrow ? 420 : 380}>
        <BarChart data={benchData} layout="vertical" margin={{ top: 5, right: 46, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e8ee" horizontal={false} />
          <XAxis type="number" tick={AXIS} domain={[0, 3.5]} label={{ value: "MAE (mph)", position: "insideBottom", offset: -2, style: AXIS }} />
          <YAxis type="category" dataKey="model" tick={AXIS} width={narrow ? 118 : 140} />
          <Tooltip {...tooltipStyle} formatter={(v, n, p) => [v.toFixed(p.payload.source === "published" ? 2 : 3) + " mph", p.payload.source === "published" ? "MAE (published)" : "MAE (this work)"]} />
          <Bar dataKey="mae" radius={[0, 4, 4, 0]} maxBarSize={26}>
            {benchData.map((b) => <Cell key={b.model} fill={b.source === "published" ? "#a5adb6" : b.model.startsWith("HICP") ? "#1f4e8c" : "#5b8fd0"} />)}
            <LabelList dataKey="label" position="right" style={AXIS} />
          </Bar>
        </BarChart>
      </ChartCard>
      <div className="table-wrap">
        <table>
          <caption>PEMS-BAY test errors (thesis Table 4.6). MAE and RMSE in mph.</caption>
          <thead>
            <tr><th rowSpan={2}>Model</th><th rowSpan={2}>Source</th><th colSpan={2} className="center">15 min</th><th colSpan={2} className="center">30 min</th><th colSpan={2} className="center">60 min</th></tr>
            <tr><th className="num">MAE</th><th className="num">RMSE</th><th className="num">MAE</th><th className="num">RMSE</th><th className="num">MAE</th><th className="num">RMSE</th></tr>
          </thead>
          <tbody>
            {benchmark.map((b) => {
              const d = b.source === "published" ? 2 : 3;
              return (
                <tr key={b.model} className={b.model.startsWith("HICP") ? "highlight" : b.source === "this work" ? "thiswork" : ""}>
                  <td>{b.model}</td>
                  <td>{b.source === "published" ? <>published <Cite keys="wu2019graphwavenet" /></> : "this thesis"}</td>
                  {[0, 1, 2].map((k) => [
                    <td key={`m${k}`} className="num">{b.mae[k].toFixed(d)}</td>,
                    <td key={`r${k}`} className="num">{b.rmse[k].toFixed(d)}</td>,
                  ])}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Note tone="caution">
        The six published rows are quoted from the PEMS-BAY table of Graph WaveNet <Cite keys="wu2019graphwavenet" />, which
        reports ARIMA, FC-LSTM and DCRNN from <Cite keys="li2018dcrnn" />, STGCN from <Cite keys="yu2018stgcn" /> and WaveNet
        from <Cite keys="oord2016wavenet" />. They follow their own papers' protocols and were not reproduced here, so they are
        indicative comparisons. The last three rows are single-seed runs of this thesis; both HICP rows use the one-hop VAR
        support.
      </Note>
      <div className="prose">
        <p>
          Against the per-sensor LSTM, the spatial machinery of HICP is worth 4.5%, 7.5% and 13.0% of MAE at the three
          horizons (100 epochs). The 100-epoch model is ahead of ARIMA, FC-LSTM, WaveNet, STGCN and DCRNN on every metric at
          every horizon, behind Graph WaveNet by 2.1%, 2.7% and 1.5% in MAE, and ahead of it at 60 minutes in RMSE (4.434
          against 4.52). Training for 100 instead of 40 epochs lowers MAE by 0.7–1.6%, more than any graph choice.
        </p>
      </div>
      <ThesisFigure
        src="figures/fig_actual_vs_predicted.png"
        width={1963}
        height={1563}
        alt="Measured and predicted speed at sensor 230 over two weekdays at 15, 30 and 60 minutes ahead"
        label="Thesis Figure 4.3"
        caption="Measured and predicted speed at sensor index 230 (the median sensor by test MAE) on 30 and 31 May 2017, for the proposed configuration on seed 42, at 15, 30 and 60 minutes ahead. Longer horizons react later to the onset and end of congestion."
      />
    </Section>
  );
}
