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

## 3. Projected viability and time-measure diagnostics

For browser visualization only,

\[
\mathcal K_{\mathrm{proj}}=\{x\in[0,1]^4:x_i\ge \underline{x}_i\;\forall i\}.
\]

Define the projected viability margin

\[
m_V(t)=\min_i\left(x_i(t)-\underline{x}_i\right).
\]

The displayed viable duration approximates the Lebesgue time measure

\[
T_V=\mu\{t\in[0,T]:m_V(t)\ge0\},
\qquad
\phi_V=\frac{T_V}{T}.
\]

Likewise, for a composite-service floor \(S_{\min}\), the displayed service-violation duration approximates

\[
T_{\mathrm{viol}}=\mu\{t\in[0,T]:S(t)<S_{\min}\},
\qquad
\phi_{\mathrm{viol}}=\frac{T_{\mathrm{viol}}}{T}.
\]

These durations are **numerical estimates**. Between consecutive RK4 output states, threshold-crossing times are approximated by linear interpolation of the relevant scalar margin. This is more rigorous than counting sampled states, but it is not an exact analytical measure of the continuous trajectory.

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

For the reduced demonstrator, the displayed mean-service resilience index is

\[
R_T=\frac{1}{T}\int_0^T S(t)\,dt.
\]

Numerically, the integral is evaluated by the trapezoidal rule over the RK4 trajectory. This is one possible resilience functional, not a universal definition of resilience.

## 5. Time integration

The state equation is advanced using classical explicit fourth-order Runge–Kutta (RK4). For nominal step \(\Delta t\), the final step is shortened when necessary so that the numerical trajectory terminates exactly at the requested horizon \(T\). Thus the algorithm does not intentionally integrate beyond \(T\) and then relabel the terminal time.

State variables are normalized and projected numerically to \([0,1]\) after each RK4 step. That projection is a demonstrator safeguard, not a claim that the underlying differential system analytically preserves the unit hypercube for all parameter values.

A publication-grade model should additionally report timestep-convergence evidence and, when appropriate, compare against an independent solver or manufactured/analytical solution.

## 6. Inverse-problem demonstrator

Sparse synthetic observations satisfy

\[
y_k=S(t_k;\alpha^*)+\varepsilon_k,
\]

and the browser estimates a hidden hazard multiplier through

\[
\hat\alpha=\arg\min_\alpha\sum_k[y_k-S(t_k;\alpha)]^2.
\]

The current browser experiment uses a fixed pseudo-random seed and deterministic grid search. Re-running it with unchanged controls therefore reproduces the same synthetic noise realization and objective geometry.

Thesis-grade inverse analysis should additionally examine:

1. structural and practical identifiability;
2. parameter correlations and non-uniqueness;
3. observation operator design;
4. heteroscedastic and correlated errors;
5. Bayesian posterior uncertainty;
6. model discrepancy;
7. interface-topology uncertainty.

## 7. Uncertainty quantification

The browser Monte Carlo experiment perturbs hazard, coupling and recovery multipliers with seeded lognormal factors. It reports empirical quantiles and

\[
\widehat{P}_f=\frac{1}{N}\sum_{n=1}^N
\mathbf{1}\{\min_t S^{(n)}(t)<S_{\min}\}.
\]

This estimates only the probability under the **declared illustrative parameter distribution**. It is not a field-calibrated failure probability.

Future research-grade extensions include variance decomposition, Sobol indices, polynomial chaos, importance sampling, subset simulation, multilevel Monte Carlo, Bayesian UQ and rare-event large-deviation methods.

## 8. Dynamic-interface formulation

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

## 9. Modern scientific machine learning

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

## 10. Mathematical atlas status

The interactive atlas is a curated conceptual map connecting major mathematical families relevant or adjacent to the portfolio. It is neither an MSC classification nor a claim to cover every active subfield of mathematics.

Its purpose is to show how pure foundations, applied analysis, stochastic mathematics, computational methods and scientific machine learning connect to infrastructure questions.

## 11. Numerical verification policy

Every mathematical demonstrator should satisfy, where applicable:

- deterministic tests with fixed seeds;
- state-domain invariants;
- exact handling of the declared terminal horizon;
- convergence studies under timestep/grid refinement;
- sensitivity to initial/boundary conditions;
- dimensional and unit consistency when physical units are introduced;
- comparison against analytical or manufactured solutions when available;
- independent reference implementation for high-stakes results;
- explicit uncertainty and calibration provenance.

The automated model suite currently verifies:

1. normalized-state bounds;
2. exact termination at a non-grid-aligned horizon;
3. declared service-weight normalization;
4. linear threshold-crossing time integration on a known case;
5. consistency of viability/violation durations and fractions;
6. control monotonicity in the declared baseline scenario;
7. Monte Carlo reproducibility for a fixed seed;
8. rejection of invalid Monte Carlo sample counts;
9. recovery of a synthetic inverse parameter.

These tests verify implementation properties. They do **not** validate the demonstrator against real infrastructure observations.

## 12. Reproducibility and dependency policy

Core equations live in `assets/model.js`, separate from UI code in `assets/app.js`. The numerical engine has no external runtime dependency.

Browser visualization uses version-pinned scientific dependencies where practical. D3 is pinned to `7.9.0` and MathJax is pinned to `3.2.2`. WebGL shader compilation and linking are checked at runtime; when WebGL or D3 is unavailable, the interface exposes a fallback rather than silently presenting an empty visualization.

Run locally:

```bash
npm test
npm run verify
```

The repository also contains a production HTTP audit intended to execute from GitHub-hosted CI against the deployed GitHub Pages URL. It tests deployment reachability, required local assets, and key source/metadata markers. A production HTTP smoke test is complementary to, not a substitute for, full cross-browser visual regression testing.

No result should be described as empirical, calibrated or validated unless the corresponding dataset, provenance, calibration method and validation evidence are committed or externally cited.

## 13. Public/private boundary

A public research portfolio must not imply that private repositories are publicly inspectable. Projects backed by private repositories are therefore described publicly without linking visitors to inaccessible source locations. Public repositories are linked directly.

This boundary is about access transparency, not scientific status: a private project may still be methodologically rigorous, while a public repository may still contain demonstrator-only results.
