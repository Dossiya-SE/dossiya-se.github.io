# Research Ecosystem Visual Specification v1

## Purpose
The Research Ecosystem Atlas is an account-level navigation model for the Dossiya-SE GitHub repositories. It is not a scientific model of the systems studied inside those repositories.

## Semantic invariant
```text
atlas edge = primary navigation membership
atlas edge != causality
atlas edge != theorem dependency
atlas edge != evidence strength
atlas edge != scientific influence
atlas edge != research importance
atlas edge != temporal sequence
```

Each repository receives exactly one primary navigation family in the tree. Cross-cutting roles belong in tags or future typed non-tree views.

## Visual-selection rule
| Relationship | Required visual grammar |
|---|---|
| hierarchy / taxonomy | tree or dendrogram |
| causal mechanism | directed graph with typed direction |
| physical interdependency | coupled/multilayer network |
| state evolution | trajectory / state-space representation |
| mathematical geometry | exact SVG / Canvas / WebGL from governing mathematics |
| quantitative evidence | scale-correct chart with units and uncertainty where applicable |
| transformation over time | animation only when the animated variable is declared |

No repository may receive a visualization merely because that visualization is aesthetically attractive.

## Geometry
The interactive atlas uses `d3.cluster()`. For every parent-child pair, the cubic Bézier control abscissa is

```math
x_m=\frac{x_p+x_c}{2},
```

so the curve is derived from computed node geometry rather than arbitrary fixed offsets.

## Color
Canvas and panels remain white. Light Sky Blue `#87CEFA` is the primary family/accent channel; Deep Sky Blue `#00BFFF` is reserved for strong interactive emphasis. Labels and geometry remain sufficient without color.

Repository-specific visual authorities remain authoritative inside their own scope. In particular, this atlas does not overwrite the MSE-thesis / Deck3 scientific figure authority.

## Interaction
Interaction must reveal information or improve navigation. Current permitted interactions are family filtering, repository selection, keyboard selection and outbound repository navigation. Decorative particle motion, floating nodes and physics simulation are excluded.

## Accessibility
- semantic text boundary above the graph;
- SVG accessible name/caption;
- keyboard-selectable repository nodes;
- visible focus;
- color-redundant labels;
- responsive overflow rather than illegible shrinking;
- `prefers-reduced-motion` honored.

## GitHub surfaces
- `research-ecosystem.html`: interactive GitHub Pages atlas;
- `research-ecosystem.json`: governed machine-readable taxonomy;
- `assets/research-ecosystem.js`: deterministic interaction and geometry;
- `assets/research-ecosystem.css`: visual grammar;
- `assets/research-ecosystem-static.svg`: README-safe static master.

## Next repository-level phase
For each repository:
1. inventory authoritative content and existing figures;
2. classify every candidate relationship;
3. retain, repair, replace or reject each visual;
4. specify mathematical/physical semantics before implementation;
5. produce deterministic static master;
6. add interaction only when scientifically meaningful;
7. verify content, geometry, accessibility, responsiveness and evidence boundaries;
8. integrate README fallback and, where appropriate, an interactive GitHub Pages surface.

A repository-level visualization is complete only when its meaning can be stated without reference to its appearance.
