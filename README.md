# Dossiya Dakou — Mathematical Research Portfolio

[![Verify mathematical portfolio](https://github.com/Dossiya-SE/dossiya-se.github.io/actions/workflows/verify.yml/badge.svg)](https://github.com/Dossiya-SE/dossiya-se.github.io/actions/workflows/verify.yml)
[![Production portfolio audit](https://github.com/Dossiya-SE/dossiya-se.github.io/actions/workflows/production-audit.yml/badge.svg)](https://github.com/Dossiya-SE/dossiya-se.github.io/actions/workflows/production-audit.yml)

**Live site:** https://dossiya-se.github.io/

This repository is the public source for an auditable mathematical-computational research portfolio spanning sustainable engineering, mathematical physics, infrastructure resilience, inverse problems, uncertainty quantification and scientific computing.

The project is deliberately built around a rule:

> **Visual sophistication is not evidence. Every important mathematical or scientific claim must have an explicit status, source, implementation and validation boundary.**

## What is actually implemented

The current site contains:

- native WebGL mathematical phase/viability-field artwork;
- a D3 interactive mathematics atlas;
- a nonlinear four-sector **Power–Water–Transport–Solid-Waste (P–W–T–SW)** demonstrator;
- classical fourth-order Runge–Kutta integration;
- projected viability margins and time-measure diagnostics;
- a composite-service functional;
- a seeded one-parameter inverse problem;
- seeded Monte Carlo uncertainty propagation;
- D3 and WebGL runtime fallbacks;
- keyboard-operable mathematics-atlas nodes;
- machine-readable `research.json` metadata;
- automated source verification;
- automated HTTP audit of the deployed GitHub Pages site.

## Epistemic status

The site uses four explicit classes:

| Class | Meaning | Example |
|---|---|---|
| **A — Established mathematics** | Standard mathematical definitions or numerical methods | RK4, Monte Carlo sampling, least-squares objective |
| **B — Research demonstrator** | Interpretable model implemented for mechanism exploration | Current P–W–T–SW browser ODE |
| **C — Proposed research object** | Thesis-level construct requiring evidence and validation | Sustainable-equitable viability architecture |
| **D — Frontier method** | Modern method whose utility does not imply a guarantee | Physics-informed learning / operator learning |

No browser output is presented as a calibrated field prediction.

## Core reduced demonstrator

The implemented normalized model is

```math
\dot{x}_i
=
r_i(1-x_i)
+b_i u(1-x_i)
-h_i(t)x_i
-\sum_{j\ne i}c_{ij}x_i(1-x_j).
```

with composite service

```math
S(t)=w^T x(t), \qquad \sum_i w_i=1.
```

The displayed mean-service functional is

```math
R_T=\frac{1}{T}\int_0^T S(t)\,dt.
```

The current parameter values and sector weights are illustrative. They are not empirical estimates of a particular infrastructure system.

## Numerical rigor

The solver uses classical RK4 and shortens the final step when necessary so that a non-grid-aligned simulation ends at the declared horizon rather than integrating beyond it.

Projected viable time is treated as a **time-measure approximation**, not a fraction of stored output samples. For viability margin

```math
m_V(t)=\min_i[x_i(t)-\underline{x}_i],
```

the diagnostic approximates

```math
T_V=\mu\{t\in[0,T]:m_V(t)\ge 0\}
```

using linear interpolation of threshold crossings between consecutive RK4 output states.

The same logic is used for the duration below the composite-service floor.

## Verification evidence

The automated model suite currently checks nine implementation properties:

1. normalized states remain in `[0,1]`;
2. non-grid-aligned horizons terminate exactly at `T`;
3. declared service weights sum to one;
4. threshold-crossing time integration matches a known linear case;
5. viable/violation durations and fractions are internally consistent;
6. additional recovery control improves the declared baseline case;
7. Monte Carlo output is reproducible for a fixed seed;
8. invalid Monte Carlo sample counts are rejected;
9. a synthetic hidden hazard multiplier is recovered by inverse grid search.

These tests verify **implementation properties**. They do not validate the model against real infrastructure observations.

Run locally:

```bash
npm test
npm run verify
npm run audit:production
```

The production audit separately checks the deployed site, required assets, visualization mounts, metadata and runtime-source markers.

## Inverse-problem boundary

Synthetic observations are generated as

```math
y_k=S(t_k;\alpha^*)+\varepsilon_k
```

and the browser estimates the hidden hazard multiplier by

```math
\hat\alpha
=
\arg\min_{\alpha}
\sum_k[y_k-S(t_k;\alpha)]^2.
```

The experiment is seeded. Unchanged controls reproduce the same synthetic noise realization. It demonstrates inverse-model plumbing and objective geometry; it does not establish identifiability for a field system.

## Uncertainty boundary

The Monte Carlo experiment perturbs declared hazard, coupling and recovery multipliers and reports empirical quantiles plus

```math
\widehat P_f
=
\frac{1}{N}
\sum_{n=1}^{N}
\mathbf 1\{\min_t S^{(n)}(t)<S_{\min}\}.
```

This probability is conditional on the illustrative parameter distributions. It is **not a field-calibrated failure probability**.

## Mathematical knowledge architecture

The mathematics atlas is currently a curated conceptual graph. It is not yet presented as a formal ontology or theorem-dependency graph.

The formalization roadmap uses recognized knowledge-organization references:

- **MSC2020** as the primary disciplinary taxonomy reference;
- **W3C SKOS** for standardized taxonomy relations such as `broader`, `narrower` and `related`;
- **W3C PROV-O** as a provenance-model reference for evidence lineage;
- theorem-level implication only where an explicit mathematical result or formal proof dependency supports it.

This prevents an unlabeled visual edge from being misread as a theorem-level implication.

## Systems-engineering reference

For systems-level project structure, **ISO/IEC/IEEE 15288:2023** is treated as a life-cycle process reference. The repository does **not** claim formal ISO certification or audited compliance.

## Evidence chain required for future calibrated work

The next scientific gate is:

```text
verified source/data
→ observation model
→ parameter/interface identification
→ calibration
→ out-of-sample validation
→ uncertainty propagation
→ viability/reachability analysis
→ decision/control
```

A result should not be labeled `empirical`, `calibrated`, `validated`, or `digital twin` unless that chain is documented.

## Repository structure

```text
.
├── index.html
├── assets/
│   ├── app.js                  # browser interaction, D3 and WebGL
│   ├── model.js                # numerical/probabilistic engine
│   └── styles.css
├── tests/
│   └── model.test.mjs          # mathematical implementation tests
├── scripts/
│   ├── verify.mjs              # source/metadata/rigor verification
│   └── production-audit.mjs    # deployed-site HTTP audit
├── .github/workflows/
│   ├── verify.yml
│   └── production-audit.yml
├── RESEARCH_RIGOR.md
├── AUDIT_REPORT_2026-08-21.md
├── REFERENCES_2026.md
├── research.json
├── robots.txt
├── sitemap.xml
├── 404.html
└── package.json
```

## Evidence and audit documents

- [`RESEARCH_RIGOR.md`](RESEARCH_RIGOR.md) — equations, assumptions, numerical semantics and limitations.
- [`AUDIT_REPORT_2026-08-21.md`](AUDIT_REPORT_2026-08-21.md) — post-merge production/mathematical audit and corrected findings.
- [`REFERENCES_2026.md`](REFERENCES_2026.md) — frontier-method reference ledger.
- [`research.json`](research.json) — machine-readable identity and epistemic-status metadata.

## External runtime libraries

- D3 `7.9.0` — interactive visualization.
- MathJax `3.2.2` — mathematical typesetting.
- Native WebGL — mathematical field rendering.

The numerical core in `assets/model.js` does not depend on D3, MathJax or WebGL.

## Reproducibility contract

For any future result promoted from demonstrator to evidence, commit or cite:

1. data/source provenance;
2. units and definitions;
3. model equations and assumptions;
4. parameter-estimation method;
5. uncertainty model;
6. numerical resolution / convergence evidence;
7. validation protocol;
8. code and environment information;
9. sensitivity or robustness analysis;
10. a statement of what the result does **not** establish.

---

**Research rule:** software verification, mathematical consistency and empirical validation are different claims and are reported separately.
