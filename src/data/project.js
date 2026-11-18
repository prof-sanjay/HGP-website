// Front matter of the thesis (title page, bonafide certificate, acknowledgement, abstract), copied from
// HGP/thesis/hgp/thesis_full.tex. Wording is kept as in the thesis.

export const project = {
  title: "Horizon-Specific Causal Graphs with False Discovery Rate Control for Multi-Horizon Traffic Forecasting",
  student: "Sanjay Muraleedharan",
  roll: "CB.SC.P2CSE25032",
  degree: "Master of Technology",
  degreeShort: "M.Tech",
  department: "Computer Science and Engineering",
  school: "Amrita School of Computing",
  university: "Amrita Vishwa Vidyapeetham",
  location: "Coimbatore – 641 112",
  course: "24CS798 / 24AI798 – Dissertation Phase I",
  advisor: "Dr. B. A. Sabarish",
  advisorDesignation: "Assistant Professor (Sl.Gd.)",
  chairperson: "Dr. P. Bagavathi Sivakumar",
  date: "November 2026",
  year: "2026",
  code: "https://github.com/prof-sanjay/HGP",
};

export const certificateText =
  "This is to certify that the thesis entitled HORIZON-SPECIFIC CAUSAL GRAPHS WITH FALSE DISCOVERY RATE CONTROL FOR " +
  "MULTI-HORIZON TRAFFIC FORECASTING, submitted by SANJAY MURALEEDHARAN [CB.SC.P2CSE25032], in partial fulfillment of " +
  "the requirements for the award of degree of Master of Technology in Computer Science and Engineering, is a bonafide " +
  "record of the work carried out under my guidance and supervision at the Department of Computer Science and " +
  "Engineering, Amrita School of Computing, Coimbatore.";

export const acknowledgement = [
  "I would like to express my deep gratitude to our beloved Chancellor Satguru Sri Mata Amritanandamayi Devi for providing a bright academic climate in this university, which has made this entire task appreciable. I would like to thank the management of Amrita Vishwa Vidyapeetham and the entire fraternity of the Department of Computer Science and Engineering, Amrita School of Computing, for providing me with the necessary infrastructure required for the completion of the project.",
  "I wish to record my deep sense of gratitude and profound thanks to my research supervisor Dr. B. A. Sabarish, Assistant Professor (Sl.Gd.), Department of Computer Science and Engineering, Amrita School of Computing, Amrita Vishwa Vidyapeetham, Coimbatore, for the keen interest, inspiring guidance and constant encouragement extended to my work at every stage, which brought this thesis to fruition.",
  "I extend my sincere thanks and gratitude to all the members of the review panel, for their timely guidance and suggestions for the improvement of my thesis work.",
  "I would like to extend my sincere thanks to my family and friends for helping and motivating me throughout the course of this project.",
  "Finally, I would like to thank all those who have helped, guided and encouraged me directly or indirectly during the project work.",
  "Above all, I extend my heartfelt salutations to my beloved parents and Almighty, for their blessings and grace, for the successful completion of this thesis.",
];

export const abstract = [
  "Graph-based traffic forecasters give every sensor a set of neighbours to consult, and in nearly all published models that set is the same whether the forecast reaches five minutes or one hour ahead. Congestion travels at a finite speed, so the locations whose present state says something about a sensor's future ought to change with the horizon. This thesis examines that proposition directly. It contributes a graph construction, called Part A, that builds one directed graph per forecast horizon from training data alone: a road-restricted vector autoregression supplies horizon-specific directed effects through its impulse responses, and a group knockoff filter decides, sensor by sensor, which candidate sources improve the h-step-ahead prediction, with the false discovery rate of the selected edges held below a chosen level. It also contributes a forecaster, HICP, that routes each horizon's prediction through its own graph behind a horizon-conditioned gate, so that every graph configuration trains with the same parameter count and the graphs alone are under test.",
  "The evaluation was carried out on the PEMS-BAY speed dataset (325 sensors) over three random seeds under a protocol and a decision rule fixed in advance. The knockoff-selected graphs lower the test error of the forecaster at every horizon, by about 0.9% in mean absolute error with road-based and learned similarity branches also present, and the gain is largest at the sixty-minute horizon. The central hypothesis, however, is not supported: a forecaster using the sixty-minute graph at every horizon is indistinguishable from one using the matched graph at each horizon, and deliberately mismatching graphs to horizons costs nothing. The graphs do differ across horizons, but the forecaster cannot turn that difference into accuracy. A control graph that shares only two fifths of its edges with the knockoff selection reaches the same accuracy, which locates the value of the selection step in its error control rather than in the particular edges chosen. Trained for 100 epochs, the forecaster is ahead of the published errors of DCRNN, STGCN, WaveNet and FC-LSTM at every horizon, within about 2% of Graph WaveNet in mean absolute error, and ahead of it at sixty minutes in root mean squared error. The thesis reports these findings, positive and negative, in the form the pre-registered design prescribed.",
];

export const keywords = [
  "Traffic forecasting", "Multi-horizon prediction", "Graph construction", "Vector autoregression",
  "Impulse response", "Knockoff filter", "False discovery rate", "Granger causality",
];
