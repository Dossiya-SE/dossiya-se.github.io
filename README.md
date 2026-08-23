# Dossiya Dakou — Engineering, Mathematics & Sustainable Resilience

[![Verify mathematical portfolio](https://github.com/Dossiya-SE/dossiya-se.github.io/actions/workflows/verify.yml/badge.svg)](https://github.com/Dossiya-SE/dossiya-se.github.io/actions/workflows/verify.yml)
[![Production portfolio audit](https://github.com/Dossiya-SE/dossiya-se.github.io/actions/workflows/production-audit.yml/badge.svg)](https://github.com/Dossiya-SE/dossiya-se.github.io/actions/workflows/production-audit.yml)

**Live mathematical research portfolio:** https://dossiya-se.github.io/

## Professional trajectory

```text
2016 electrical-engineering practice
→ renewable energy + energy systems
→ ongoing Sustainable Engineering
→ ongoing Financial Engineering
→ deeper discrete/differential geometry + dynamical systems + scientific computing
→ cross-sector sustainable-resilience research
```

The website is the interactive public presentation layer for this trajectory. It is intentionally broader than any single research project.

- **Electrical / energy foundations:** physical implementation, measurement, balance, control and system integration.
- **Sustainable Engineering:** coupled infrastructure, constraints, viability, recovery and resilience.
- **Financial Engineering:** stochastic systems, econometrics, derivatives, regimes, risk, optimization and model validation.
- **Forward mathematical research:** discrete/differential geometry, mathematical physics, dynamical systems, network science, scientific computing and mathematical visualization.

**Boundary:** cross-sector mathematical transferability is a research programme, not an already validated universal theory.

## Research invariant

```math
\boxed{\text{claim strength}\le\text{evidence strength}}
```

Mathematical sophistication, visual quality, software verification and empirical validation are different claims and remain separate.

## Executable infrastructure demonstrator

The website retains a reduced Power–Water–Transport–Solid-Waste research demonstrator as one specialized application surface within the broader portfolio.

| Visual / computational object | Executable evidence |
|---|---|
| coupled P–W–T–SW state | `assets/model.js` |
| RK4 trajectories | numerical core + model tests |
| inverse recovery | seeded synthetic inverse experiment |
| uncertainty envelope | seeded Monte Carlo experiment |
| viability margin/time | threshold-crossing time integration |
| interactive mathematics network / field | D3 + native WebGL |
| verification lattice | `tests/`, `scripts/verify.mjs`, production audit |

The reduced demonstrator is

```math
\dot{x}_i=r_i(1-x_i)+b_i u(1-x_i)-h_i(t)x_i-\sum_{j\ne i}c_{ij}x_i(1-x_j),
\qquad S(t)=w^T x(t).
```

The inverse experiment uses

```math
y_k=S(t_k;\alpha^*)+\varepsilon_k,
\qquad
\hat\alpha=\arg\min_\alpha\sum_k[y_k-S(t_k;\alpha)]^2.
```

The Monte Carlo diagnostic reports an empirical conditional simulation estimate

```math
\widehat P_f=N^{-1}\sum_{n=1}^N \mathbf 1\{\min_t S^{(n)}(t)<S_{\min}\}.
```

Current parameters are illustrative. Browser output is **not** presented as a calibrated field prediction or validated digital twin.

## Public identity assets

- `assets/profile-trajectory-v1.svg` — governed 2016→2026 engineering-to-mathematics trajectory.
- `assets/profile-mathematics-universe-v4.svg` — adaptive V4 profile mathematics architecture.
- `assets/profile-v1.css` — professional green identity and page-composition layer.

## Verification ≠ validation

```bash
npm test
npm run verify
npm run audit:production
```

The automated suite checks state bounds, final-horizon handling, service-weight consistency, threshold-crossing time, viability-duration consistency, recovery-control behavior, seeded reproducibility, invalid-sample rejection and synthetic inverse recovery.

Passing these gates verifies implementation properties. Empirical promotion requires:

`source/data → observation model → identification → calibration → out-of-sample validation → UQ → viability/reachability → decision`

## Audit trail

[`RESEARCH_RIGOR.md`](RESEARCH_RIGOR.md) · [`AUDIT_REPORT_2026-08-21.md`](AUDIT_REPORT_2026-08-21.md) · [`REFERENCES_2026.md`](REFERENCES_2026.md) · [`research.json`](research.json)

> **Research rule:** engineering identity, mathematical specification, software verification and empirical validation are different layers and are reported separately.
