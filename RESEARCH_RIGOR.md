# Research rigor and mathematical status

This portfolio is designed as an auditable research interface. It distinguishes established mathematics from illustrative reduced models, proposed thesis constructions, and frontier computational methods.

## 1. Epistemic status system

### A — Established mathematics

Standard mathematical objects and numerical procedures used without claiming novelty, including:

- ordinary and partial differential equations;
- conservation laws and dynamical systems;
- graph and multilayer-network representations;
- probability, stochastic processes, reliability and extreme-value methods;
- inverse problems, identifiability, Bayesian inference, filtering and data assimilation;
- convex/nonconvex optimization, optimal control, model-predictive control, reachability and viability;
- finite-difference/finite-volume/finite-element/spectral families;
- Monte Carlo uncertainty propagation;
- numerical integration with classical fourth-order Runge–Kutta.

### B — Research demonstrator

The browser laboratory uses a reduced normalized four-sector state

\[
x(t)=\begin{bmatrix}x_P(t)&x_W(t)&x_T(t)&x_{SW}(t)\end{bmatrix}^{\!T}\in[0,1]^4,
\]

with illustrative dynamics

\[
\dot{x}_i=r_i(1-x_i)+b_i u(1-x_i)-h_i(t)x_i-\sum_{j\ne i}c_{ij}x_i(1-x_j).
\]

Interpretation:

- \(r_i(1-x_i)\): endogenous recovery toward nominal service;
- \(b_i u(1-x_i)\): bounded recovery intervention;
- \(h_i(t)x_i\): hazard-induced degradation;
- \(c_{ij}x_i(1-x_j)\): asymmetric service dependency penalty.

The equation is deliberately interpretable and computationally stable for a browser demonstrator. It is **not** asserted to be a validated physical law for any specific city or infrastructure operator.

## 2. Composite service functional

The demonstrator uses

\[
S(t)=w^Tx(t),\qquad w_i\ge 0,\quad \sum_i w_i=1.
\]

Current illustrative weights are

\[
w=(0.32,0.25,0.25,0.18)^T.
\]

These weights are placeholders for a future service-to-population mapping. They must not be interpreted as empirically estimated sector importance.

## 3. Projected viability test

For browser visualization only,

\[
\mathcal K_{\mathrm{proj}}=\{x\in[0,1]^4:x_i\ge \underline{x}_i\;\forall i\}.
\]

The displayed “viable time” is the fraction of simulated time samples inside this threshold set.

The thesis-level object is conceptually stronger:

\[
\mathcal V_{\mathrm{sus,eq}}=
\left\{x_0:\exists u(\cdot)\;\text{s.t.}\;x(t)\in
\mathcal K_{\mathrm{safe}}\cap
\mathcal K_{\mathrm{sustainable}}\cap
\mathcal K_{\mathrm{equitable}},\;\forall t\in[0,T]\right\}.
\]

Computing or approximating this controlled viability kernel requires a formally specified state, admissible-control set, dynamics, constraints, uncertainty model and numerical method. The website does not claim that this full kernel has been computed.

## 4. Resilience functional

For the reduced demonstrator, the displayed resilience index is the time-average composite service:

\[
R_T=\frac{1}{T}\int_0^T S(t)\,dt.
\]

Numerically, the integral is evaluated by the trapezoidal rule over the RK4 trajectory. This is one possible resilience functional, not a universal definition of resilience.

## 5. Inverse-problem demonstrator

Sparse synthetic observations satisfy

\[
y_k=S(t_k;\alpha^*)+\varepsilon_k,
\]

and the browser estimates a hidden hazard multiplier through

\[
\hat\alpha=\arg\min_\alpha\sum_k[y_k-S(t_k;\alpha)]^2.
\]

The current implementation uses deterministic grid search to expose objective geometry. Thesis-grade inverse analysis should additionally examine:

1. structural and practical identifiability;
2. parameter correlations and non-uniqueness;
3. observation operator design;
4. heteroscedastic and correlated errors;
5. Bayesian posterior uncertainty;
6. model discrepancy;
7. interface-topology uncertainty.

## 6. Uncertainty quantification

The browser Monte Carlo experiment perturbs hazard, coupling and recovery multipliers with seeded lognormal factors. It reports empirical quantiles and

\[
\widehat{P}_f=\frac{1}{N}\sum_{n=1}^N
\mathbf{1}\{\min_t S^{(n)}(t)<S_{\min}\}.
\]

This estimates only the probability under the **declared illustrative parameter distribution**. It is not a field-calibrated failure probability.

Future research-grade extensions include variance decomposition, Sobol indices, polynomial chaos, importance sampling, subset simulation, multilevel Monte Carlo, Bayesian UQ and rare-event large-deviation methods.

## 7. Dynamic-interface formulation

The broader thesis architecture permits a time-varying coupling object

\[
G(t)=\{G_{ij}(t)\},
\]

and sector dynamics of the form

\[
\dot{x}_i=f_i(x_i,\theta_i)+\sum_jg_{ij}(x_i,x_j,G_{ij},\theta_{ij})+B_i u_i+\xi_i.
\]

A central inverse question is the propagation

\[
\mathcal D_{obs}\rightarrow(\widehat G_{ij},\widehat\theta_{ij})
\rightarrow\Sigma_\theta
\rightarrow\mathcal V_{\mathrm{sus,eq}},
\]

where uncertainty in inferred interfaces changes uncertainty in the feasible/viable region.

## 8. Modern scientific machine learning

Operator learning and physics-informed machine learning are treated as frontier extensions. They may provide fast surrogates for PDE solution operators, inverse mappings and many-query digital-twin calculations, but must be evaluated against:

- conservation and physical consistency;
- discretization and resolution dependence;
- approximation and generalization error;
- uncertainty calibration;
- out-of-distribution performance;
- stability and robustness;
- high-fidelity numerical baselines.

The portfolio therefore follows the rule:

> learned surrogate ≠ mathematical guarantee.

## 9. Mathematical atlas status

The interactive atlas is a curated conceptual map connecting major mathematical families relevant or adjacent to the portfolio. It is neither an MSC classification nor a claim to cover every active subfield of mathematics.

Its purpose is to show how pure foundations, applied analysis, stochastic mathematics, computational methods and scientific machine learning connect to infrastructure questions.

## 10. Numerical verification policy

Every mathematical demonstrator should satisfy, where applicable:

- deterministic tests with fixed seeds;
- state-domain invariants;
- convergence studies under timestep/grid refinement;
- sensitivity to initial/boundary conditions;
- dimensional and unit consistency when physical units are introduced;
- comparison against analytical or manufactured solutions when available;
- independent reference implementation for high-stakes results;
- explicit uncertainty and calibration provenance.

The current repository includes automated tests for bounded states, service weights, control monotonicity in the baseline case, Monte Carlo reproducibility and recovery of a noiseless synthetic inverse parameter.

## 11. Reproducibility

Core equations live in `assets/model.js`, separate from UI code in `assets/app.js`. Browser visualization uses D3 and WebGL, while the numerical engine itself has no external runtime dependency.

Run locally:

```bash
npm test
npm run verify
```

No result should be described as empirical, calibrated or validated unless the corresponding dataset, provenance, calibration method and validation evidence are committed or externally cited.
