// Mermaid definitions of the technical diagrams. Every box corresponds to a step described in Chapter 3 of the thesis.

export const overall = `flowchart LR
  D["PEMS-BAY training rows<br/>325 sensors, 5-min speed"] --> A
  subgraph A["Part A · horizon-specific graph generation"]
    direction TB
    A1["Two-hop ridge VAR<br/>+ impulse responses Ψ_h"] --> A2["Group knockoff filter<br/>FDR level q = 0.3"]
  end
  A --> G3["G3 · 15 min"]
  A --> G6["G6 · 30 min"]
  A --> G12["G12 · 60 min"]
  subgraph B["Part B · HICP forecaster"]
    direction TB
    B1["Shared GRU encoder"] --> B2["One branch per horizon<br/>causal · physical · semantic + gate"]
  end
  X["Last 12 steps<br/>of every sensor"] --> B
  G3 --> B
  G6 --> B
  G12 --> B
  B --> Y["Forecasts at<br/>15 / 30 / 60 min"]`;

export const partA = `flowchart TB
  S1["1 · PEMS-BAY training rows<br/>(70% chronological split, no validation or test rows)"]
  S2["2 · Ridge VAR of order p = 3<br/>each equation restricted to the sensor and its two-hop road neighbours"]
  S3["3 · Impulse responses Ψ_h for h = 3, 6, 12<br/>total effect of every source on every target after h steps"]
  S4["4 · Two-hop candidate pool C_i<br/>34.0 candidates per target on average"]
  S5["5 · Group knockoff filter on the h-step-ahead relation<br/>one test per target and horizon"]
  S6["6 · knockoff+ threshold at FDR level q = 0.3<br/>at most 25 sources per target"]
  S7["7 · Weighted directed graph G_h<br/>edge weight = standardised impulse response"]
  S1 --> S2 --> S3
  S1 --> S4 --> S5 --> S6 --> S7
  S3 --> S7
  S7 --> O1["G3 · 15 min · 2,919 edges"]
  S7 --> O2["G6 · 30 min · 3,164 edges"]
  S7 --> O3["G12 · 60 min · 3,229 edges"]`;

export const knockoff = `flowchart TB
  K0["Target sensor i, horizon h"] --> K1["Remove time-of-day means; keep every 3rd row (stride 3)"]
  K1 --> K2["Response: x_i(t+h) with the target's own past projected out"]
  K1 --> K3["Candidates: x_j(t) for every j in the pool C_i, residualised the same way"]
  K3 --> K4["Group candidates by average linkage at |r| ≥ 0.5"]
  K4 --> K5["Sample second-order Gaussian group knockoffs X̃"]
  K2 --> K6["Lasso path of the response on [X, X̃]"]
  K5 --> K6
  K6 --> K7["Statistic per group: W_g = λ_g − λ̃_g<br/>(entry penalty of the group minus that of its knockoff)"]
  K7 --> K8["knockoff+ threshold τ at level q = 0.3"]
  K8 --> K9["Keep groups with W_g ≥ τ<br/>one representative each, at most 25 sources"]
  K9 --> K10["Selected sources of i at horizon h = incoming edges of G_h"]`;

export const hicp = `flowchart LR
  IN["1 · Input window<br/>12 steps × 325 sensors<br/>speed + 4 time features"] --> GRU["2 · Shared per-node GRU<br/>temporal encoding z_i"]
  GRU --> B3["3–5 · Branches for 15 min<br/>causal hop over G3<br/>physical hop over road graph<br/>semantic hop over learned graph"]
  GRU --> B6["3–5 · Branches for 30 min<br/>causal hop over G6<br/>physical hop over road graph<br/>semantic hop over learned graph"]
  GRU --> B12["3–5 · Branches for 60 min<br/>causal hop over G12<br/>physical hop over road graph<br/>semantic hop over learned graph"]
  B3 --> GT3["6 · Gate<br/>embedding e_3"] --> O3["7 · Head 15 min<br/>8 · ŷ at t + 15 min"]
  B6 --> GT6["6 · Gate<br/>embedding e_6"] --> O6["7 · Head 30 min<br/>8 · ŷ at t + 30 min"]
  B12 --> GT12["6 · Gate<br/>embedding e_12"] --> O12["7 · Head 60 min<br/>8 · ŷ at t + 60 min"]
  GRU -. "z_i (self path)" .-> GT3
  GRU -.-> GT6
  GRU -.-> GT12`;

export const branches = `flowchart LR
  G3["G3<br/>15-min graph"] --> B3["Branch h = 3"]
  G6["G6<br/>30-min graph"] --> B6["Branch h = 6"]
  G12["G12<br/>60-min graph"] --> B12["Branch h = 12"]
  R["Road adjacency<br/>(one graph, all horizons)"] -.-> B3
  R -.-> B6
  R -.-> B12
  E["Learned similarity graph A_sem<br/>(one graph, all horizons)"] -.-> B3
  E -.-> B6
  E -.-> B12
  B3 --> Y3["ŷ at 15 min"]
  B6 --> Y6["ŷ at 30 min"]
  B12 --> Y12["ŷ at 60 min"]`;

export const gate = `flowchart LR
  Z["z_i<br/>own encoding"] --> CAT["Concatenate"]
  SC["s_i^(h,c)<br/>causal"] --> CAT
  SP["s_i^(h,p)<br/>physical"] --> CAT
  SS["s_i^(h,s)<br/>semantic"] --> CAT
  EH["e_h<br/>horizon embedding"] --> CAT
  CAT --> MLP["MLP shared<br/>across horizons"]
  MLP --> LOG["Logits [0, l_c, l_p, l_s]<br/>self logit fixed at 0"]
  LOG --> SM["Softmax → α_i^h<br/>4 weights summing to 1"]
  SM --> MIX["u_i^h = α_0 z_i + Σ_m α_m s_i^(h,m)"]
  Z -.-> MIX
  SC -.-> MIX
  SP -.-> MIX
  SS -.-> MIX
  MIX --> HEAD["Linear head of horizon h → ŷ_i^h"]`;

export const experiment = `flowchart TB
  F["Fixed: architecture, protocol, 327,483 parameters,<br/>road and similarity branches, seed 42"] --> C
  C{"Graphs given to<br/>the causal branch"}
  C --> P["Proposed<br/>G3 / G6 / G12"]
  C --> A["g12_all<br/>G12 everywhere"]
  C --> B["g3_all<br/>G3 everywhere"]
  C --> S["Shuffled<br/>G6 / G12 / G3"]
  C --> N["None<br/>no causal graph"]
  P --> T["Test MAE / RMSE / MAPE at 15, 30, 60 min"]
  A --> T
  B --> T
  S --> T
  N --> T
  T --> R{"Pre-registered rule: Proposed beats g12_all<br/>at h = 6 and h = 12 by more than the seed spread?"}
  R -- "yes" --> Y["horizon-indexed propagation helps"]
  R -- "no (observed)" --> V["long-reach graph generation helps;<br/>horizon matching does not add to it"]`;
