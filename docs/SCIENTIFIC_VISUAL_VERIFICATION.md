# Scientific visual verification suite — candidate

Three *synthetic* demonstrations at [scientific-visual-verification.html](../scientific-visual-verification.html).

1. Thermal interface: **two separate, unverified** physical coupling hypotheses, not empirical or calibrated thesis laws.
2. Linear dynamics: exact solution for a stable focus; trajectory endpoint, radius identity, and centered-difference ODE residual are checked.
3. Repository taxonomy: 18 unique repository IDs in five primary navigation families; edges mean **membership only**.

## Scientific boundary
This prototype does not modify MSE-thesis canonical models, equations, figures, Deck3 colors, evidence or physical parameters. Its white/sky-blue palette governs only this separate demonstration.

## Release gate
The inline checks run in the browser; they are not a substitute for CI, keyboard/accessibility audits, responsive browser verification, and independent physical review. Promote only after those gates are demonstrated. Do not label the thermal hypotheses validated.

## Test plan
- Open in desktop and narrow mobile browser widths; confirm no clipped labels or broken SVGs.
- Select every navigation family and a repository using mouse and keyboard.
- Sweep the time slider to 0 and 18; confirm exact endpoint and small radius residual.
- Confirm there are no network requests, decorative motion, gold, gradients, shadows or colored panels.
- Independently verify ODE residual, unique IDs and source-authority compliance.
