# Portfolio Visual System V2

**Status:** candidate governing visual contract  
**Scope:** `https://dossiya-se.github.io/` public portfolio  
**Change class:** presentation / interaction / accessibility only  
**Numerical model:** unchanged

## Objective

The portfolio must read as one professional mathematical-research environment rather than a sequence of unrelated dashboards, card grids, and diagrams.

The governing visual sequence is:

```text
identity
→ trajectory
→ research programmes
→ mathematical structure
→ executable evidence
→ validation
→ computing
→ education
```

## Design invariants

1. **Green is the identity color, not a fake metric.**
2. **Scientific semantic colors remain distinct** when they encode source/model/computed/verified/empirical/hypothesis/target or domain role.
3. **Deterministic geometry replaces decorative randomness.** The mathematics atlas uses fixed, reproducible positions; reloads do not rearrange the intellectual map.
4. **Mathematical art must carry semantics.** Curves, fields, manifolds, trajectories, links, and boundaries must correspond to declared mathematical roles.
5. **Typography carries hierarchy before borders do.** Borders are reduced; spacing, alignment, weight, and tonal contrast do more of the organizational work.
6. **One radius/elevation system.** Repeated surfaces share consistent corner radii, border strength, and shadow depth.
7. **Dense mathematics receives breathing room.** Equations are not forced into small boxes when a larger scientific field is more legible.
8. **Interactivity must be inspectable.** Selected atlas families visibly identify their role, representative formula, and topics without implying theorem-level or causal dependence.
9. **Accessibility is part of rigor.** Focus states, reduced motion, keyboard selection, text fallbacks, and high-contrast light/dark rendering remain required.
10. **Visual refinement cannot strengthen claims.** Simulation remains simulation; source mathematics remains source mathematics; hypotheses remain hypotheses.

## Section-specific corrections

### Hero
- Reduce visual competition between text and animated field.
- Use deep research green with restrained mathematical grid/field structure.
- Keep identity, trajectory statement, and evidence invariant dominant.

### Trajectory
- Preserve conceptual 2016→2026 status.
- Increase whitespace and reduce card-like fragmentation.

### Research programmes
- Use evidence-boundary accents and compact metadata.
- Avoid equal visual weight for every paragraph.

### Mathematics atlas
- Remove force-directed simulation.
- Use deterministic layered coordinates.
- Use pill/node forms with mathematical glyphs, readable labels, curved links, and active-neighbour emphasis.
- Selected-family panel exposes representative formula + portfolio role + topics.

### Mathematics operating system
- Rebuild as a vector mathematical field with three levels: foundations, operators, transfer bridge.
- Replace cramped generic rectangles with larger semantic modules and mathematical motifs.
- Preserve source-vs-hypothesis distinction.

### Formula atlas
- Reduce box density.
- Use evidence color as a narrow semantic edge/tag rather than full-surface decoration.
- Improve equation whitespace and reading order.

### Laboratory / inverse / uncertainty
- Preserve numerical algorithms and model code.
- Increase chart legibility, metric hierarchy, control grouping, and state/threshold contrast.

### Evidence
- Make `claim strength ≤ evidence strength` the visual anchor.
- Keep verification links subordinate to the evidence argument.

### Computing
- Present tool roles as a professional capability matrix rather than a badge inventory.

### Education
- Preserve ongoing/completed status explicitly.
- Use the current public undergraduate title: **BSc Physical Science in Renewable Energy and Energy System**.

## Acceptance gates

A V2 release passes only when:

- the mathematics atlas contains no `d3.forceSimulation` dependency;
- atlas positions are deterministic and keyboard-selectable;
- the operating-system SVG retains `<title>`, `<desc>`, `viewBox`, source/hypothesis labels, and adaptive theme tokens;
- all existing model tests pass unchanged;
- mathematical-display verification passes;
- production source audit passes;
- no credential status or scientific claim is strengthened by presentation changes.
