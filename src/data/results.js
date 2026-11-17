// Every number on the results pages, taken from Chapters 3 and 4 of the thesis (PEMS-BAY test split).
// MAE and RMSE in mph, MAPE in per cent. Nothing here is simulated.

export const dataset = [
  ["Dataset", "PEMS-BAY (San Francisco Bay Area)"],
  ["Quantity", "Speed, mph"],
  ["Traffic sensors", "325"],
  ["Time resolution", "5 minutes"],
  ["Number of rows", "52,116"],
  ["Training split", "70% (chronological)"],
  ["Validation split", "10%"],
  ["Test split", "20%"],
  ["Average direct road neighbours", "7.3"],
  ["Average two-hop candidate pool", "34.0"],
  ["Forecast horizons", "15, 30, 60 minutes (h = 3, 6, 12 steps)"],
  ["FDR level q", "0.3"],
  ["Masked MAPE threshold", "≥ 1 mph"],
  ["Missing values", "zeros treated as missing (0.003% of entries)"],
];

// Table 3.2 of the thesis
export const configurations = [
  { name: "Proposed", graphs: "G3 / G6 / G12", question: "the full hypothesis" },
  { name: "g12_all", graphs: "G12 / G12 / G12", question: "does matching add to long reach? (decisive)" },
  { name: "g3_all", graphs: "G3 / G3 / G3", question: "short reach everywhere" },
  { name: "Shuffled", graphs: "G6 / G12 / G3", question: "does the graph–horizon pairing matter?" },
  { name: "None", graphs: "no causal graph", question: "the per-node floor (road and similarity branches only)" },
];

// Table 4.1: edges per graph (Section 4.1)
export const edgeCounts = [
  { graph: "G3 (15 min)", edges: 2919 },
  { graph: "G6 (30 min)", edges: 3164 },
  { graph: "G12 (60 min)", edges: 3229 },
];

// Table 4.1: edge inclusion across horizons
export const overlap = [
  { comparison: "15 vs 30 min", shared: 2329, pct: 62, rank: 0.79 },
  { comparison: "30 vs 60 min", shared: 2338, pct: 58, rank: 0.87 },
  { comparison: "15 vs 60 min", shared: 1927, pct: 46, rank: 0.59 },
];

// Table 4.2: graph configurations, seed 42
export const configResults = [
  { name: "Proposed", graphs: "G3 / G6 / G12", h15: 1.333, h30: 1.684, h60: 2.009, mae: 1.675, rmse: 3.683, mape: 3.838 },
  { name: "g12_all", graphs: "G12 / G12 / G12", h15: 1.337, h30: 1.688, h60: 2.015, mae: 1.680, rmse: 3.693, mape: 3.844 },
  { name: "g3_all", graphs: "G3 / G3 / G3", h15: 1.335, h30: 1.689, h60: 2.015, mae: 1.680, rmse: 3.691, mape: 3.848 },
  { name: "Shuffled", graphs: "G6 / G12 / G3", h15: 1.336, h30: 1.689, h60: 2.017, mae: 1.680, rmse: 3.696, mape: 3.848 },
  { name: "None", graphs: "no causal graph", h15: 1.340, h30: 1.698, h60: 2.031, mae: 1.690, rmse: 3.715, mape: 3.878 },
];

// Table 4.3: Part A ablation, seed 42
export const ablation = [
  { name: "Proposed", change: "knockoff-selected graphs G3 / G6 / G12", h15: 1.333, h30: 1.684, h60: 2.009, mae: 1.675, rmse: 3.683, mape: 3.838 },
  { name: "Without Part A", change: "causal branch given no graph; road and similarity branches kept", h15: 1.340, h30: 1.698, h60: 2.031, mae: 1.690, rmse: 3.715, mape: 3.878 },
  { name: "Without knockoff selection", change: "same number of sources per target, chosen by the size of the impulse response", h15: 1.336, h30: 1.688, h60: 2.015, mae: 1.680, rmse: 3.695, mape: 3.852 },
];

// Table 4.4: VAR support
export const varSupport = [
  { name: "One road hop (earlier version)", h15: 1.336, h30: 1.689, h60: 2.013, mae: 1.679, rmse: 3.691 },
  { name: "Two-hop pool (adopted)", h15: 1.333, h30: 1.684, h60: 2.009, mae: 1.675, rmse: 3.683 },
];

// Table 4.5: proposed configuration over three seeds (MAE)
export const seeds = [
  { seed: 42, h15: 1.333, h30: 1.684, h60: 2.009 },
  { seed: 7, h15: 1.336, h30: 1.690, h60: 2.019 },
  { seed: 123, h15: 1.336, h30: 1.692, h60: 2.021 },
];

// Table 4.6: published values (quoted from the PEMS-BAY table of Graph WaveNet, ref [4]) and runs of this thesis
export const benchmark = [
  { model: "ARIMA", source: "published", mae: [1.62, 2.33, 3.38], rmse: [3.30, 4.76, 6.50] },
  { model: "FC-LSTM", source: "published", mae: [2.05, 2.20, 2.37], rmse: [4.19, 4.55, 4.96] },
  { model: "WaveNet", source: "published", mae: [1.39, 1.83, 2.35], rmse: [3.01, 4.21, 5.43] },
  { model: "DCRNN", source: "published", mae: [1.38, 1.74, 2.07], rmse: [2.95, 3.97, 4.74] },
  { model: "STGCN", source: "published", mae: [1.36, 1.81, 2.49], rmse: [2.96, 4.27, 5.69] },
  { model: "Graph WaveNet", source: "published", mae: [1.30, 1.63, 1.95], rmse: [2.74, 3.70, 4.52] },
  { model: "Per-sensor LSTM", source: "this work", mae: [1.389, 1.810, 2.277], rmse: [2.981, 4.110, 5.182] },
  { model: "HICP – 40 epochs", source: "this work", mae: [1.336, 1.689, 2.013], rmse: [2.806, 3.768, 4.498] },
  { model: "HICP – 100 epochs", source: "this work", mae: [1.327, 1.674, 1.980], rmse: [2.787, 3.748, 4.434] },
];
