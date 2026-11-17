import { hicp, partA } from "../data/diagrams";
import { eq } from "../data/equations";
import { Cite, Diagram, Equation, M, Note, Section, ThesisFigure } from "./common";

export function Methodology() {
  return (
    <Section id="methodology" title="Proposed Methodology – HGP" kicker="Chapter 3">
      <div className="prose">
        <p>
          HGP separates two responsibilities. Part A answers, for each horizon, the question "who should inform whom?" with a
          statistical procedure whose error rate is controlled; Part B answers "how should the forecaster use that answer?"
          with an architecture that treats the graphs as fixed, exchangeable inputs.
        </p>
      </div>
      <ThesisFigure
        src="figures/fig_hgp_architecture.png"
        width={2000}
        height={1114}
        alt="Overview of HGP: Part A builds G3, G6 and G12; Part B, HICP, uses each graph in its own horizon branch"
        label="Thesis Figure 3.1"
        caption="Overview of HGP. Part A (top) builds one graph per forecast horizon from the training rows; Part B (bottom), the HICP forecaster, gives each horizon its own branch over its own graph. All three horizons are produced in one forward pass."
      />

      <h3 id="part-a" className="part-heading">Part A · Horizon-specific graph generation</h3>
      <Diagram number={1} code={partA} caption="Part A pipeline, run once per horizon h. The same fitted VAR serves every horizon through its impulse responses; the knockoff filter is run on the h-step-ahead relation." />

      <div className="steps">
        <div className="step">
          <h4>Step 1–2 · Road-restricted ridge VAR</h4>
          <p>The speed vector of all sensors is modelled as a vector autoregression of order <M>p = 3</M> <Cite keys="sims1980" />:</p>
          <Equation tex={eq.var} number="3.1" />
          <p>
            Every <M>A_k</M> is restricted to the diagonal and to the sensors within two road hops (the candidate pool).
            An unrestricted VAR on 325 sensors would have over 300,000 coefficients, most describing pairs no road
            connects; the restriction reduces each equation to about 34 pool members over three lags. Each equation is
            fitted separately by ridge regression (penalty <M>{String.raw`10^{6}`}</M>) on observed training rows only.
          </p>
        </div>
        <div className="step">
          <h4>Step 3 · Impulse responses per horizon</h4>
          <p>A 60-minute forecast needs the total effect accumulated along all paths, not lag-1 effects. The recursion</p>
          <Equation tex={eq.irf} number="3.2" />
          <p>
            gives <M>{String.raw`\Psi_h[i,j]`}</M>, the effect of a unit innovation at sensor <M>j</M> on sensor <M>i</M>{" "}
            after <M>h</M> steps. Effects are standardised for ranking and weighting, following the caution of Reisach et al.{" "}
            <Cite keys="reisach2021" /> about scale artefacts:
          </p>
          <Equation tex={eq.effect} label="Standardised effect" />
          <p>
            Because <M>A_k</M> lives on the two-hop road support, the set of sensors with a non-zero effect on a target widens
            as <M>h</M> grows. The quantity is read as Granger-type predictive influence, never as structural causation.
          </p>
        </div>
        <div className="step">
          <h4>Step 4 · Two-hop candidate pool</h4>
          <p>
            For target <M>i</M>, the candidate set <M>{String.raw`\mathcal{C}_i`}</M> holds the sensors within two road hops
            (undirected): 34.0 candidates per target on average (range 0 to 100), against 7.3 one-hop road neighbours. The
            pool is also the support of the VAR, so every candidate carries an impulse-response effect.
          </p>
        </div>
        <div className="step">
          <h4>Step 5 · Group knockoff filter on the h-step-ahead relation</h4>
          <p>
            Time-of-day means are removed and every third row is kept (one row per 15 minutes) to weaken serial dependence.
            The response is the target's future value with its own history projected out, so the procedure measures what
            sources add <em>beyond</em> the target's own past, the Granger condition in conditional form:
          </p>
          <Equation tex={eq.resid} number="3.3" />
          <p>
            Corridor sensors are nearly collinear, so candidates are grouped by average linkage at <M>{String.raw`|r| \ge 0.5`}</M>{" "}
            and selection operates on groups <Cite keys="dai2016group" />. Second-order Gaussian group knockoffs{" "}
            <M>{String.raw`\tilde{X}`}</M> copy the correlation structure of the real candidates but carry no information
            about the response beyond what that structure forces:
          </p>
          <Equation tex={eq.knockoff} number="3.4" />
          <p>
            with <M>\gamma</M> the largest value keeping the joint covariance positive semi-definite. A lasso path of the
            response on <M>{String.raw`[X, \tilde{X}]`}</M> records the penalty at which each column enters; the group
            statistic is large and positive when the real group enters well before its knockoff copy, and symmetric around
            zero for a null group:
          </p>
          <Equation tex={eq.wstat} number="3.5" />
        </div>
        <div className="step">
          <h4>Step 6 · knockoff+ threshold at q = 0.3</h4>
          <Equation tex={eq.thresh} number="3.6" />
          <p>
            Groups with <M>{String.raw`W_g \ge \tau`}</M> are selected; one representative per group is kept and at most 25
            sources per target. Under the model-X assumptions this guarantees <M>{eq.fdr}</M> over the selected set{" "}
            <Cite keys="candes2018" />. A target whose groups all fall below the threshold receives no sources.
          </p>
          <Note tone="caution">
            <strong>Assumptions behind the guarantee.</strong> The FDR bound holds exactly only under the model-X
            assumptions. Here the candidate distribution is replaced by its second moments, and the rows remain serially
            dependent despite detrending, own-lag residualisation and thinning <Cite keys="chi2025tski" />. The guarantee is
            therefore approximate on this data: the selected edges are a controlled-error selection, not a certified one.
          </Note>
        </div>
        <div className="step">
          <h4>Step 7 · Graph assembly</h4>
          <p>
            Each selected edge is weighted by its standardised impulse response. All weights are rescaled so that the mean
            non-zero weight matches that of the unfiltered VAR graph at the same horizon. The result is one directed weighted
            graph <M>G_h</M> per horizon with zero diagonal: <strong>G3</strong> (15 min, 2,919 edges),{" "}
            <strong>G6</strong> (30 min, 3,164 edges) and <strong>G12</strong> (60 min, 3,229 edges).
          </p>
        </div>
      </div>

      <h3 id="part-b" className="part-heading">Part B · The HICP forecaster</h3>
      <Diagram number={2} code={hicp} caption="HICP architecture: a shared GRU encoder feeds three horizon branches; each branch propagates over its own causal graph plus the road and learned similarity graphs, and a gate and head produce that horizon's forecast." />
      <div className="steps">
        <div className="step">
          <h4>1 · Input traffic history</h4>
          <p>
            Each sensor enters with <M>F = 5</M> features per step for the last <M>T = 12</M> steps (one hour): the
            standardised speed and the sine and cosine of time of day and of day of week.
          </p>
        </div>
        <div className="step">
          <h4>2 · Shared GRU temporal encoder</h4>
          <Equation tex={eq.gru} number="3.7" />
          <p>One GRU, shared by all sensors, encodes each sensor's window independently, so <M>z_i</M> contains no cross-sensor information and the parameter count does not grow with the number of sensors.</p>
        </div>
        <div className="step">
          <h4>3 · Horizon-specific causal propagation</h4>
          <p>Each graph is row-normalised over incoming edges, which respects edge direction:</p>
          <Equation tex={eq.rownorm} number="3.8" />
          <p>The horizon-<M>h</M> causal representation is one directed hop over that horizon's graph:</p>
          <Equation tex={eq.prop} number="3.9" />
          <p>It is applied once, on the output side, so an edge keeps its meaning (source <M>j</M> informs target <M>i</M> at <M>t+h</M>) instead of acting as a smoother at every input step.</p>
        </div>
        <div className="step">
          <h4>4 · Physical road-graph branch</h4>
          <p>The same one-hop operation over the row-normalised road adjacency <M>{String.raw`A_{\mathrm{road}}`}</M>: one graph for all horizons, separate weights <M>{String.raw`W^{p}_h`}</M> per horizon.</p>
        </div>
        <div className="step">
          <h4>5 · Learned semantic-similarity branch</h4>
          <Equation tex={eq.sem} number="3.10" />
          <p>
            <M>E_t, E_s</M> are node-embedding tables trained with the model (<M>d_s = 16</M>); <M>{String.raw`\mathcal{N}_k(i)`}</M>{" "}
            holds the <M>k = 25</M> most similar sources of <M>i</M>, excluding <M>i</M>. Road and similarity branches are what
            current forecasters fuse with their own graphs, so the causal graph is judged in the company it would keep in a
            modern model.
          </p>
        </div>
        <div className="step">
          <h4>6 · Horizon-conditioned adaptive gate</h4>
          <Equation tex={eq.gate} number="3.11" />
          <p>
            A learned embedding <M>e_h</M> per horizon conditions a node-wise softmax over the self path and the three
            branches. The self logit is fixed at zero and the MLP is shared across horizons, so the horizon enters only through{" "}
            <M>e_h</M>. The gate can close any branch wherever it hurts, which makes the graph-free forecaster the floor of every
            configuration, and the parameter count is identical whichever graphs a branch receives.
          </p>
        </div>
        <div className="step">
          <h4>7–8 · Horizon-specific heads and predictions</h4>
          <p>
            A linear head per horizon maps <M>u^h_i</M> to the forecast; all horizons come out of one forward pass, and
            predictions are de-standardised with training statistics. The training loss is the masked MAE averaged with
            uniform weights over horizons. The full model has 327,483 parameters.
          </p>
        </div>
      </div>
    </Section>
  );
}
