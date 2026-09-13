<p align="center">
  <img src="assets/portfolio-v2-hero.svg" width="860" alt="Power and transportation infrastructure connected through causal interfaces to mathematical state-space reasoning and engineering intervention">
</p>

<h1 align="center">Dossiya Dakou · Research Portfolio</h1>

<p align="center">
  <strong>Physics-grounded mathematical engineering for sustainable infrastructure</strong><br>
  Physical Reality → Causal Mechanisms → Mathematical Structure → Engineering Decision
</p>

<p align="center">
  <a href="https://dossiya-se.github.io/"><strong>Live Portfolio</strong></a>
  ·
  <a href="https://dossiya-se.github.io/lab.html">Research Laboratory</a>
  ·
  <a href="https://orcid.org/0009-0004-1071-9948">ORCID</a>
  ·
  <a href="https://www.linkedin.com/in/dossiya-dakou-/">LinkedIn</a>
</p>

<p align="center">
  <a href="https://github.com/Dossiya-SE/dossiya-se.github.io/actions/workflows/verify.yml"><img src="https://github.com/Dossiya-SE/dossiya-se.github.io/actions/workflows/verify.yml/badge.svg" alt="Verify mathematical portfolio"></a>
  <a href="https://github.com/Dossiya-SE/dossiya-se.github.io/actions/workflows/production-audit.yml"><img src="https://github.com/Dossiya-SE/dossiya-se.github.io/actions/workflows/production-audit.yml/badge.svg" alt="Production portfolio audit"></a>
</p>

---

## Purpose

This repository powers my public research portfolio. Its purpose is not to present mathematics as decoration or software as proof of scientific validity. It documents a research method in which **physical systems and causal mechanisms constrain the mathematical abstraction**, and mathematical structure is then used for analysis, computation, uncertainty reasoning and engineering decisions.

The current research focus is **interdependent power and transportation infrastructure**, with information and organization represented as supporting non-physical layers when they alter physical operation, coordination, propagation or recovery.

```math
\boxed{
\text{Physical Reality}
\rightarrow
\text{Causal Mechanisms}
\rightarrow
\text{Governing Relations}
\rightarrow
\text{Mathematical Structure}
\rightarrow
\text{Dynamics + Uncertainty}
\rightarrow
\text{Validation}
\rightarrow
\text{Engineering Decision}
}
```

---

## Current research system

The principal physical system is

```math
\boxed{
\mathcal G_{\mathrm P}
\leftrightarrow
\mathcal I_{\mathrm{PT}}
\leftrightarrow
\mathcal G_{\mathrm T}
}
```

where power and transportation are treated as distinct physical infrastructures coupled through explicit interfaces rather than merged into one undifferentiated network.

A rigorous interdependency object is represented as

```math
\mathfrak I_{ij}^{\alpha\beta}
=
\left(
E_i^\alpha,
E_j^\beta,
M_{ij},
w_{ij},
\delta_{ij},
\tau_{ij},
a_{ij},
m,
\mathcal H_t
\right).
```

The research progression is

```math
\boxed{
\mathcal R_{\mathrm{phys}}
\rightarrow
\mathcal C
\rightarrow
(\mathcal G,\mathfrak I)
\rightarrow
F_{\mathcal G}
\rightarrow
\mathcal V
\rightarrow
\rho_g
\rightarrow
u^\star
}
```

with the interpretation:

| Object | Engineering meaning |
|---|---|
| `\mathcal R_{\mathrm{phys}}` | components, flows, services, constraints, hazards and timescales |
| `\mathcal C` | physically defensible causal mechanisms |
| `\mathcal G, \mathfrak I` | multilayer structure and explicit interdependencies |
| `F_{\mathcal G}` | coupled system dynamics |
| `\mathcal V` | admissible / viable operating region |
| `\rho_g` | geometric resilience quantity when a justified metric exists |
| `u^\star` | engineering intervention or control decision |

These are research objects. Their physical interpretation, parameterization and validity must be established for the specific engineering system under study.

---

## Research method

<p align="center">
  <img src="assets/portfolio-v2-method.svg" width="980" alt="Research method from physical reality and causal mechanisms through mathematical structure, uncertainty and validation to engineering decision">
</p>

The ordering is intentional:

1. **Physical reality** — define the system boundary, components, flows, services, limits, hazards, variables and units.
2. **Causal mechanisms** — identify how one component or subsystem changes another, including direction, delay, activation and evidence.
3. **Governing relations** — enforce relevant conservation laws, constitutive behavior, operating constraints and feasibility conditions.
4. **Mathematical structure** — choose graphs, differential equations, dynamical systems, topology, geometry, probability or optimization because they match the mechanism.
5. **Analysis + computation** — establish what can be understood analytically before relying on numerical simulation.
6. **Uncertainty + validation** — separate measurement, parameter, structural, hazard and numerical uncertainty and test the model against appropriate evidence.
7. **Engineering decision** — compare interventions, restoration actions, control strategies or designs under stated constraints.

---

## Mathematical foundations for engineering systems

| Mathematical foundation | Role in the research |
|---|---|
| **Differential geometry** | state-space structure, metrics, geodesic reasoning and boundary geometry |
| **Graph theory & topology** | multilayer infrastructure structure, connectivity and interface representation |
| **Analysis & differential equations** | state evolution, bounds, continuous dynamics and conservation structure |
| **Dynamical systems** | equilibria, stability, transitions, propagation and recovery trajectories |
| **Probability & stochastic processes** | hazards, observations, uncertainty, reliability and inference |
| **Optimization & control** | intervention, restoration, constrained design and resource allocation |

The mathematical object is selected because it helps represent or interrogate the engineering mechanism—not because it is mathematically sophisticated.

---

## Portfolio architecture

The repository deliberately separates the **professional research surface** from the **executable research laboratory**.

```text
Public visitor
   │
   ├── index.html
   │     Professional research identity
   │     Current Power–Transportation focus
   │     Physics → causality → mathematics → decision
   │     Selected work, experience and education
   │
   ├── lab.html
   │     Preserved executable research demonstrators
   │     D3 / MathJax visualizations
   │     Reduced-order infrastructure simulation
   │     Inverse problem
   │     Monte Carlo uncertainty propagation
   │
   ├── research.json
   │     Machine-readable research metadata
   │
   └── RESEARCH_RIGOR.md
         Scientific status, evidence and validation boundaries
```

### Main implementation surfaces

| Surface | Role |
|---|---|
| `index.html` | professional research homepage |
| `assets/portfolio-v2.css` | current visual system |
| `assets/portfolio-v2-hero.svg` | research identity visual |
| `assets/portfolio-v2-method.svg` | methodology visual |
| `lab.html` | executable research laboratory |
| `assets/model.js` | reduced-order numerical model used by the preserved lab |
| `assets/app.js` | D3 / browser interaction for the preserved lab |
| `research.json` | structured public research metadata |
| `scripts/verify.mjs` | static structure and scientific-governance checks |
| `scripts/verify-math-display.mjs` | mathematical-display and lab-preservation checks |
| `scripts/production-audit.mjs` | deployed-site verification |

---

## Visual semantics

The visual system is semantic rather than decorative.

| Visual code | Meaning |
|---|---|
| **Charcoal** | physical system / engineering structure |
| **Gold** | causal interface, dependency or engineering decision |
| **Blue** | mathematical state, dynamics or state-space geometry |
| **Grey** | secondary structure, uncertainty or supporting information |

The same visual grammar is used across the homepage and mathematical/engineering diagrams so that color and line style preserve meaning across representations.

---

## Scientific standard

The governing invariant is

```math
\boxed{
\text{claim strength}
\le
\text{evidence strength}
}
```

and the portfolio explicitly distinguishes

```math
\boxed{
\text{Definition}
\neq
\text{Model}
\neq
\text{Computation}
\neq
\text{Verification}
\neq
\text{Empirical Validation}
}
```

Accordingly:

- correlation is not treated as causation without a defensible mechanism;
- mathematical elegance is not treated as physical validity;
- simulation output is not relabeled as observation;
- passing software tests is not relabeled as empirical validation;
- uncertainty is propagated when it materially affects the engineering conclusion;
- every model should state its assumptions, variables, parameters, units, validity domain and known limitations.

The preserved browser model in `lab.html` remains a **research demonstrator**. It is not presented as a calibrated field model, empirical prediction or validated digital twin.

---

## Local verification

The portfolio is static and can be inspected directly, but the research controls are executed with Node.js.

```bash
npm test
npm run verify
npm run audit:production
```

The current verification system checks, among other things:

- professional homepage structure and research identity;
- Power–Transportation focus and public/private boundaries;
- accessibility markers in the scientific SVGs;
- preservation of the executable laboratory;
- reduced-order model invariants and reproducibility;
- research metadata consistency;
- deployed GitHub Pages content and assets.

---

## Repository structure

```text
.
├── index.html                     # professional research homepage
├── lab.html                       # executable research laboratory
├── research.json                  # machine-readable research metadata
├── RESEARCH_RIGOR.md              # epistemic / validation boundaries
├── REFERENCES_2026.md             # selected research references
├── assets/
│   ├── portfolio-v2.css           # current design system
│   ├── portfolio-v2-hero.svg      # hero scientific visual
│   ├── portfolio-v2-method.svg    # research-method visual
│   ├── model.js                   # laboratory numerical model
│   └── app.js                     # laboratory interactivity
├── scripts/
│   ├── verify.mjs
│   ├── verify-math-display.mjs
│   └── production-audit.mjs
├── tests/
└── .github/workflows/
```

---

## Research surfaces

**Professional portfolio** · https://dossiya-se.github.io/  
**Research laboratory** · https://dossiya-se.github.io/lab.html  
**GitHub profile** · https://github.com/Dossiya-SE  
**ORCID** · https://orcid.org/0009-0004-1071-9948  
**LinkedIn** · https://www.linkedin.com/in/dossiya-dakou-/

---

<p align="center">
  <strong>Observe the physical system. Identify the mechanism. Formalize mathematically. Compute. Validate. Intervene.</strong>
</p>
