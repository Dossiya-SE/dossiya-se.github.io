# Jekyll Research Publication Architecture

Status: **migration scaffold**

```text
Scientific computation
Python / JAX / SciPy / NetworkX / optimization
        ↓
Scientific outputs
JSON / CSV / SVG / validated metadata
        ↓
Knowledge model
Markdown / YAML / JSON
        ↓
Jekyll + Liquid + Collections
        ↓
MathJax / SVG-D3 / Three.js
        ↓
TypeScript / JavaScript
        ↓
validation → GitHub Actions → GitHub Pages
```

## Governing boundary

**Scientific truth is not publication representation.**

- Python and numerical libraries compute scientific results.
- YAML, JSON, and Markdown preserve research knowledge and provenance.
- Jekyll organizes scholarly content and relationships.
- MathJax typesets mathematics.
- D3/SVG renders 2D scientific visualization.
- Three.js/WebGL renders 3D scientific geometry.
- TypeScript manages browser interaction and state.
- GitHub Actions verifies the built site.

## Migration safety gates

The existing `index.html` and `lab.html` remain unchanged and `.nojekyll` remains in place.

Production cutover is blocked until:
1. Jekyll builds successfully;
2. existing Node/Python verification still passes;
3. `/` and `/lab.html` retain expected behavior;
4. generated research pages pass math, link, accessibility, and visual checks;
5. GitHub Pages is deliberately switched to an Actions deployment workflow.
