import { configurations, dataset } from "../data/results";
import { Cite, Note, Section } from "./common";

export function Dataset() {
  return (
    <Section id="dataset" title="Dataset and Experimental Setup" kicker="Chapter 3">
      <div className="two-col">
        <div>
          <h3>PEMS-BAY</h3>
          <p>
            Six months of speed measurements from 325 sensors in the San Francisco Bay Area <Cite keys="li2018dcrnn" />,
            with a road adjacency derived from driving distances.
          </p>
          <div className="table-wrap">
            <table>
              <caption>Dataset and fixed settings (thesis Table 3.1)</caption>
              <tbody>
                {dataset.map(([k, v]) => (
                  <tr key={k}>
                    <th scope="row">{k}</th>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h3>Training and evaluation protocol</h3>
          <ul className="plain-list">
            <li>AdamW, learning rate 3·10⁻⁴, one warm-up epoch, cosine decay</li>
            <li>Weight decay 10⁻⁴, gradient-norm clipping at 5, batch size 16</li>
            <li>At most 40 epochs, early stopping (patience 6) on the validation MAE averaged over horizons</li>
            <li>All configurations on seed 42; the proposed configuration also on seeds 7 and 123</li>
            <li>Test metrics: MAE, RMSE and masked MAPE per horizon</li>
            <li>Graphs and scaling from training rows only; the test split is scored once</li>
          </ul>
          <h3>Reference models</h3>
          <p>
            A per-sensor LSTM <Cite keys="hochreiter1997" /> (two layers, no graph, no gate) was trained on the same split
            under the same protocol. Published models are quoted from the PEMS-BAY table of Graph WaveNet{" "}
            <Cite keys="wu2019graphwavenet" />; those values follow their own papers' protocols and are read as indicative.
          </p>
        </div>
      </div>

      <h3>Experimental configurations</h3>
      <p>
        Every configuration uses the identical architecture, protocol and parameter count (327,483) and differs only in the
        adjacency tensors handed to the causal branch. A branch receives a graph as a tensor input, not as parameters, and the
        gate has the same inputs whether a branch receives the three horizon graphs, one graph repeated or no graph. Any
        difference in accuracy can therefore come only from the graphs (and from randomness), never from model capacity.
      </p>
      <div className="table-wrap">
        <table>
          <caption>Configurations of the causal branch (thesis Table 3.2)</caption>
          <thead>
            <tr><th>Configuration</th><th>Graph at 15 / 30 / 60 min</th><th>Question it answers</th></tr>
          </thead>
          <tbody>
            {configurations.map((c) => (
              <tr key={c.name} className={c.name === "Proposed" ? "highlight" : ""}>
                <td>{c.name}</td><td>{c.graphs}</td><td>{c.question}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note>
        <strong>Decision rule fixed in advance.</strong> Horizon-indexed propagation is claimed to help only if the proposed
        configuration beats g12_all at both <em>h</em> = 6 and <em>h</em> = 12 by more than the run-to-run spread between
        seeds, with everything else held fixed. Otherwise the result is reported as "long-reach graph generation helps;
        horizon matching does not add to it."
      </Note>
    </Section>
  );
}
