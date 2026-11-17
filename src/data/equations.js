// Equations of Chapter 3 of the thesis (numbers as in the thesis), in KaTeX syntax.

export const eq = {
  var: String.raw`x(t) \;=\; \sum_{k=1}^{p} A_k\, x(t-k) \;+\; e(t), \qquad p = 3`,
  irf: String.raw`\Psi_0 = I, \qquad \Psi_s \;=\; \sum_{k=1}^{\min(s,p)} A_k\, \Psi_{s-k}, \qquad s = 1, \ldots, h`,
  effect: String.raw`w^{h}_{ij} \;=\; |\Psi_h[i,j]|\;\frac{\sigma_j}{\sigma_i}`,
  resid: String.raw`y^h_i(t) \;=\; \tilde{x}_i(t+h) \;-\; \widehat{\mathbb{E}}\!\left[\tilde{x}_i(t+h)\,\middle|\, \tilde{x}_i(t), \tilde{x}_i(t-1), \tilde{x}_i(t-2)\right]`,
  knockoff: String.raw`\mathrm{cov}\!\begin{bmatrix} X \\ \tilde{X} \end{bmatrix} = \begin{bmatrix} \Sigma & \Sigma - S \\ \Sigma - S & \Sigma \end{bmatrix}, \qquad S = \gamma \cdot \mathrm{blockdiag}\!\left(\Sigma_{g}\right)`,
  wstat: String.raw`W_g \;=\; \lambda_g - \tilde{\lambda}_g`,
  thresh: String.raw`\tau \;=\; \min\left\{ t > 0 \;:\; \frac{1 + \#\{g : W_g \leq -t\}}{\max\!\left(1,\, \#\{g : W_g \geq t\}\right)} \;\leq\; q \right\}`,
  gru: String.raw`z_i \;=\; \mathrm{GRU}\!\left(X_i(1), \ldots, X_i(T)\right), \qquad T = 12`,
  rownorm: String.raw`\tilde{A}_h[i,j] \;=\; \frac{G_h[i,j]}{\sum_{k} G_h[i,k]}`,
  prop: String.raw`s^{h,c}_i \;=\; \mathrm{GELU}\!\left( W^{c}_h \sum_{j} \tilde{A}_h[i,j]\, z_j + b^{c}_h \right)`,
  sem: String.raw`A_{\mathrm{sem}}[i,j] \;=\; \mathrm{softmax}_{j \in \mathcal{N}_k(i)}\!\left( \frac{E_t[i] \cdot E_s[j]}{\sqrt{d_s}} \right)`,
  gate: String.raw`\begin{aligned} \alpha^{h}_i &= \mathrm{softmax}\!\left( \left[\, 0,\; \mathrm{MLP}\!\left([\,z_i;\, s^{h,m}_i \text{ for } m \in \mathcal{M};\, e_h\,]\right) \right] \right), \\ u^h_i &= \alpha^{h}_{i,0}\, z_i + \sum_{m \in \mathcal{M}} \alpha^{h}_{i,m}\, s^{h,m}_i \end{aligned}`,
  fdr: String.raw`\mathbb{E}[\mathrm{FDP}] \;\leq\; q`,
};
