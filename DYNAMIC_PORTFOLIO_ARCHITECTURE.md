# Dynamic Mathematics + Sustainability Architecture V1

## Purpose

The portfolio uses motion in two strictly separated roles:

1. Mathematical art — low-opacity vector fields, parametric curves and abstract geometry used for atmosphere and visual identity.
2. Mechanistic visualization — computation whose motion is tied to an explicitly stated mathematical model, constraint set or metric.

Decorative motion must never be presented as simulation evidence.

## Homepage mechanism

The Power–Transportation explorer uses normalized states

Y=(p,m) in [0,1]^2,

where p denotes power-service state and m denotes mobility-service state. The reduced demonstrator uses recovery, control, direct disturbance and cross-system dependency terms and is integrated using classical RK4.

The illustrative admissibility set is

K_svc = {(p,m): p >= 0.45, m >= 0.45, (p+m)/2 >= 0.60}.

This is a service admissibility demonstrator, not the full thesis-level sustainable viability set.

## Lab geometry

The geometry interaction uses the flat anisotropic metric

g_psi = dp^2 + psi^2 dm^2, psi > 0.

For the linear service constraint p+m >= 1.2, distance is computed using the metric-induced dual norm. The displayed metric ball therefore changes shape as psi changes.

This widget demonstrates how a metric alters geometric margin. It does not establish that this metric is empirically correct for infrastructure resilience.

## Sustainability boundary

Sustainability is represented as a constraint-design problem, not as green decoration. A complete K_sus may require independently defined and evidenced constraints on service adequacy, safety and physical feasibility, resource use, emissions or environmental burden, equity or distributional requirements, and restoration/operational limits.

The public interaction does not invent these quantities when data are absent.

## Visual system

Former gold/amber visual roles remain mapped to the governed light-sky-blue accent family. Other semantic channels retain their meanings:

- power: red;
- transportation / viable operation: green;
- information / state: blue;
- organization: magenta;
- mathematical structure: violet;
- interface / decision: light sky blue.

## Accessibility and performance

- prefers-reduced-motion disables continuous animation.
- Canvas visualizations have textual labels and numerical outputs.
- Interaction works without WebGL.
- No new external JavaScript dependency is required for V1.
- Device-pixel ratio is capped at 2 for canvas rendering.
- Decorative animation is paused or reduced when it is not visible.

## Verification

tests/dynamics.test.mjs verifies state bounds, hazard/control directionality and viability-margin behavior. Repository verification also checks that the dynamic assets and DOM markers remain present in source and production.


## Synchronized visualization stack

The Research Lab now uses one shared normalized state object for multiple mathematical representations. The canonical state is

\[
Y=(p,m),\qquad \psi>0,
\]

with the existing service constraints

\[
K_{\mathrm{svc}}=\{p\ge 0.45,\;m\ge 0.45,\;p+m\ge 1.20\},
\]

and metric

\[
g_\psi=\operatorname{diag}(1,\psi^2).
\]

The three signed constraint margins are

\[
d_p=p-0.45,\qquad
d_m=\psi(m-0.45),\qquad
d_s=\frac{p+m-1.20}{\sqrt{1+\psi^{-2}}}.
\]

Inside the convex service set, the minimum positive margin is the metric distance to the nearest active half-space boundary. Outside the set, the displayed quantity is explicitly described as a signed constraint margin rather than a global distance-to-set claim.

Renderer responsibilities are separated:

- MathJax: symbolic definitions and displayed equations.
- TypeScript: canonical state, invariants, constraint mathematics and synchronization contract.
- SVG/D3: inspectable two-dimensional state-space geometry.
- Three.js + WebGL + GLSL: real-time rendering of the same signed-margin scalar field.
- GeoGebra: optional exact draggable 2-D construction, loaded on demand.
- Manim: offline, reproducible publication animation; never a browser runtime dependency.

The homepage remains intentionally lighter than the Research Lab. Heavy rendering libraries are not loaded on the homepage merely for visual effect.

### Governing invariant

No animation is accepted unless its geometry or motion can be traced to an explicit mathematical quantity, state update, renderer transform or documented interaction law.

### Performance and accessibility

- WebGL uses device-pixel-ratio capping and event-driven rendering.
- The D3/SVG view remains useful if WebGL is unavailable.
- GeoGebra is lazy-loaded only after explicit user action.
- The browser does not load Manim.
- Canvas and SVG surfaces carry textual labels and synchronized numerical readouts.
