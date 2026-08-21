# Dossiya Dakou — Mathematical Research Portfolio

Static GitHub Pages portfolio for research in sustainable engineering, mathematical physics, infrastructure resilience, energy systems and scientific computing.

## What this site implements

- WebGL mathematical viability-field art in the research landing section;
- D3 interactive atlas spanning pure, applied, stochastic and computational mathematics;
- nonlinear coupled Power–Water–Transport–Solid-Waste ODE demonstrator;
- fourth-order Runge–Kutta integration in the browser;
- projected viability geometry and composite critical-service metrics;
- synthetic inverse-problem experiment for hidden hazard intensity;
- seeded Monte Carlo uncertainty propagation;
- 2026 scientific-computing frontier section covering operator learning and physics-informed modeling with explicit limitations;
- research programme and repository navigation;
- polyglot scientific-computing architecture organized by mathematical role;
- automated model tests and GitHub Actions verification.

## Scientific positioning

The site deliberately separates four statuses:

1. **Established mathematics** — canonical theory/methods.
2. **Research demonstrator** — interpretable reduced models implemented for exploration.
3. **Proposed research object** — thesis-level constructs requiring validation.
4. **Frontier method** — modern methods whose utility does not imply mathematical guarantees.

See [`RESEARCH_RIGOR.md`](RESEARCH_RIGOR.md) for equations, assumptions and limitations.

## Core reduced model

\[
\dot{x}_i=r_i(1-x_i)+b_i u(1-x_i)-h_i(t)x_i-\sum_{j\ne i}c_{ij}x_i(1-x_j).
\]

The model is normalized and illustrative. It is not a calibrated representation of any specific infrastructure system.

## Development

No build step is required for GitHub Pages.

```bash
npm test
npm run verify
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Repository structure

```text
.
├── index.html
├── assets/
│   ├── app.js          # browser interactions and D3/WebGL visualization
│   ├── model.js        # numerical and probabilistic engine
│   └── styles.css
├── tests/
│   └── model.test.mjs
├── scripts/
│   └── verify.mjs
├── .github/workflows/
│   └── verify.yml
├── RESEARCH_RIGOR.md
├── package.json
└── .nojekyll
```

## External browser libraries

- D3 7.9.0 for interactive scientific visualization.
- MathJax 3 for mathematical typesetting.
- Native WebGL for the phase/viability field artwork.

The numerical core in `assets/model.js` does not depend on those visualization libraries.

## Verification target

Every future empirical or calibrated result should include data provenance, units, calibration method, validation protocol, uncertainty model and reproducible code before the site presents it as evidence.
