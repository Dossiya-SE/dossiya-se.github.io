# Mathematical Visualization Stack V1

## Purpose

This subsystem turns the Research Lab into a synchronized mathematical instrument rather than a collection of unrelated animations.

The governing rule is:

\[
\text{definition} \rightarrow \text{state} \rightarrow \text{computation} \rightarrow \text{geometry} \rightarrow \text{renderer}.
\]

No renderer is allowed to invent a mathematical state independently.

## Canonical state

The shared state is

\[
Y=(p,m),\qquad \psi>0,
\]

where:

- \(p\) is normalized power-service state;
- \(m\) is normalized mobility-service state;
- \(\psi\) is the anisotropy parameter in the metric \(g_\psi\).

The public service set is

\[
K_{\mathrm{svc}}=\{p\ge0.45,\;m\ge0.45,\;p+m\ge1.20\}.
\]

This is the same normalized service geometry already used by the portfolio. It is not a new empirical model.

## Metric constraint mathematics

With

\[
G=\operatorname{diag}(1,\psi^2),\qquad G^{-1}=\operatorname{diag}(1,\psi^{-2}),
\]

the signed half-space margins are

\[
d_p=p-0.45,
\]

\[
d_m=\psi(m-0.45),
\]

and

\[
d_s=\frac{p+m-1.20}{\sqrt{1+\psi^{-2}}}.
\]

The displayed scalar field is

\[
\rho_{\mathrm{signed}}(p,m;\psi)=\min(d_p,d_m,d_s).
\]

For an interior point of this convex intersection, the minimum positive value is the metric distance to the nearest active half-space boundary. For points outside the set, the value is only a signed constraint margin; the interface does not call it a global distance to the feasible set.

## Renderer separation

### MathJax

Role: symbolic communication only.

### TypeScript

Canonical source: src/visualization/research-state.ts.

Role:

- define state types;
- normalize state values;
- enforce \(\psi>0\);
- compute metric margins;
- publish one state to all views.

The browser runtime is committed as assets/research-state.js so GitHub Pages remains a static deployment.

### SVG / D3

Role:

- explicit axes;
- exact polygon for \(K_{\mathrm{svc}}\);
- explicit constraint lines;
- current state point;
- local metric ball.

### Three.js / WebGL / GLSL

Role:

- render the scalar field \(\rho_{\mathrm{signed}}(p,m;\psi)\) as a surface;
- evaluate the same half-space margins in the vertex shader;
- use shader color only to distinguish signed-margin structure.

The surface height is an evaluated mathematical quantity. It is not decorative noise.

### GeoGebra

GeoGebra is loaded only after the user requests it. Its construction contains the same three constraints and state point \(Y\). The JavaScript API synchronizes point motion back to the shared state.

References:

- https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_API/
- https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_Embedding/

### Manim

Source: scripts/manim/viability_geometry_scene.py.

Role:

- publication animation;
- deterministic explanatory sequencing;
- reproducible visual output from the same constraints and RGB tokens.

Manim is not shipped to browsers.

## RGB contract

The visualization subsystem uses:

- Light Sky Blue: rgb(135, 206, 250);
- Deep Sky Blue: rgb(0, 191, 255);
- neutral dark/light values for structure, text and background.

No warm metallic accent is part of this subsystem.

## Interaction law

All synchronized controls follow

\[
\text{user action}
\rightarrow
\text{state store}
\rightarrow
\{\text{readout},\text{D3},\text{WebGL},\text{GeoGebra}\}.
\]

The state store is therefore the single source of truth.

## Accessibility and degradation

1. Numerical values remain visible independently of graphics.
2. D3/SVG remains usable when WebGL initialization fails.
3. GeoGebra is optional and lazy-loaded.
4. Manim is an offline renderer.
5. WebGL uses device-pixel-ratio capping.
6. WebGL is rendered on state/camera changes rather than an unnecessary perpetual animation loop.
7. All interactive graphics have descriptive accessible labels.

## Verification

Run:

~~~bash
npm run verify:visualization
npm run verify
~~~

Verification checks:

- required source/runtime artifacts exist;
- DOM integration markers are present;
- Three.js/GLSL and GeoGebra adapters are wired;
- TypeScript state contracts are present;
- RGB contract tokens are present;
- numerical state and metric-margin invariants pass Node tests.

## Scientific boundary

This subsystem demonstrates a mathematical representation. It does not establish calibration, empirical validity, causal identification, forecast skill or real-world intervention effectiveness. Those require separate evidence and validation.
