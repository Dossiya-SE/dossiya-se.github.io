# Runtime scientific artifacts

This directory is the browser-facing scientific data boundary.

Use it for validated JSON/CSV and visualization artifacts that TypeScript, D3, or Three.js may fetch at runtime.

Do **not** use Jekyll `_data` as a browser runtime API.

Recommended structure:

```text
assets/data/
├── dependencies.json
├── experiments/
├── simulations/
├── viability/
└── provenance/
```
