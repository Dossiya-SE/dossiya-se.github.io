# Portfolio Profile Alignment V1

**Status:** release candidate  
**Date:** 2026-08-23  
**Scope:** `Dossiya-SE/dossiya-se.github.io`

## Purpose

The website is the interactive public presentation layer for a broader professional/research trajectory:

```text
2016 electrical-engineering practice
→ renewable-energy and energy systems
→ ongoing Sustainable Engineering
→ ongoing Financial Engineering
→ deeper mathematics and scientific computing
→ cross-sector sustainable-resilience research
```

The website must not reduce this identity to a single infrastructure demonstrator, even though the executable Power–Water–Transport–Solid-Waste model remains an important research artifact.

## Public information hierarchy

```text
identity
→ professional/research trajectory
→ research programmes
→ mathematics architecture
→ executable specialist demonstrator
→ evidence / verification / validation
→ forward mathematical research
→ scientific computing + mathematical art
→ education
```

## Brand system

The primary identity palette is high-luminance/deep research green on white or deep green. Technical diagrams may retain additional semantic colors where those colors encode mathematical/evidence roles.

```text
brand green != evidence category
visual beauty != scientific evidence
```

The hero WebGL field is presentation art. Green color treatment does not alter the numerical model or any scientific result.

## Mathematical-art contract

The profile trajectory uses

```math
\gamma:[2016,2026]\rightarrow\mathcal M
```

as a **conceptual** trajectory in a profile state space. It is not:

- a measured proficiency score;
- a fitted empirical manifold;
- a geodesic claim;
- a ranking of disciplines.

The trajectory artwork links stages to domain-relevant mathematics:

- electrical/control: `ẋ = Ax + Bu`;
- energy balance: generation/import/discharge = load/loss/charge/export;
- sustainable engineering: admissible-set intersection;
- financial engineering: stochastic differential systems;
- deeper mathematics: metric and graph-Laplacian structures.

## Research-boundary contract

The following must remain explicit:

```text
cross-sector transferability = research ambition
cross-sector transferability != established universal theory
```

The browser infrastructure model remains:

```text
research demonstrator
!= calibrated digital twin
!= field prediction
```

## Credential contract

Public website education uses only currently public-safe wording:

- `MSE Sustainable Engineering — Arizona State University — ongoing`;
- `MS Financial Engineering — WorldQuant University — ongoing`;
- `Licence Professionnelle, Énergies Renouvelables et Systèmes Énergétiques — Université d’Abomey-Calavi`.

Earlier technical/professional electrical-engineering credentials are represented as the 2016 foundation, while their exact translated public titles remain under reconciliation. No silent title substitution is permitted.

## Verification contract

Pull requests validate candidate source through `npm run verify`.

Deployed-site smoke testing is intentionally not used to reject a pull request for assets that are not deployed yet. Production smoke runs after `main` updates and on scheduled/manual audits.

Required candidate controls include:

- all interactive visualization mount points remain present;
- profile trajectory and adaptive mathematics SVGs exist and contain accessibility metadata;
- ongoing graduate status remains explicit;
- browser demonstrator remains `epistemicStatus=demonstrator` and `calibrated=false`;
- private repository URLs are not exposed;
- exact MathJax/D3 versions remain pinned;
- mixed-content links are rejected.

## Canonical new assets

- `assets/profile-trajectory-v1.svg`
- `assets/profile-mathematics-universe-v4.svg`
- `assets/profile-v1.css`

## Release rule

Merge only after:

1. `Verify mathematical portfolio` passes;
2. PR `Production portfolio audit / source-verification` passes;
3. changed files are conflict-free;
4. no credential/evidence boundary is strengthened by the redesign.

After merge, the deployed production-smoke audit must pass once GitHub Pages serves the new `main` state.
