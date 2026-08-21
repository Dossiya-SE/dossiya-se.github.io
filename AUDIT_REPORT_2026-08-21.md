# Production audit report — 2026-08-21

## Executive conclusion

The portfolio passed the initial repository-level mathematical verification before merge, but the post-merge production audit identified several issues that required correction before further scientific expansion. The hardening changes are isolated on `portfolio/production-audit-hardening`. On PR #2, the corrected branch passed both the mathematical/source verification workflow and the GitHub-hosted HTTP production audit of the deployed Pages site.

## Audit scope

The audit covers:

1. GitHub Pages repository/deployment configuration signals;
2. mathematical semantics and numerical time measures;
3. exact terminal-time handling in RK4 integration;
4. deterministic inverse-problem semantics;
5. uncertainty/reproducibility controls;
6. public/private repository link integrity;
7. D3 atlas keyboard accessibility;
8. WebGL failure handling;
9. dependency version pinning;
10. canonical, OpenGraph and structured metadata;
11. crawler, sitemap and 404 hygiene;
12. machine-readable scientific/epistemic metadata;
13. automated source and production-site regression checks.

## Deployment evidence

The GitHub repository is public, uses `main` as the default branch, and GitHub repository metadata reports Pages as enabled. The mathematical portfolio PR was merged into `main` before this hardening audit.

The assistant execution environment could inspect GitHub and repository sources directly but could not establish a normal DNS/browser session to the GitHub Pages hostname. To avoid treating that environment limitation as evidence of a production failure, deployed-site reachability was delegated to GitHub-hosted Actions through `scripts/production-audit.mjs` and `.github/workflows/production-audit.yml`.

PR #2 production CI successfully retrieved the live `https://dossiya-se.github.io/` homepage and required deployed assets after the production-audit assertion was corrected to reflect the actual module architecture (`index.html → assets/app.js → assets/model.js`). The source-verification job and production-smoke job both completed successfully on the corrected branch head.

## Findings and corrections

### F1 — “Viable time” was a sample-count fraction

**Severity:** High scientific semantics

The original implementation computed the fraction of stored trajectory samples satisfying sector thresholds and displayed it as “Viable time”. A sample fraction depends on output discretization and is not a time measure.

**Correction:** define the projected viability margin

\[
m_V(t)=\min_i(x_i(t)-\underline{x}_i),
\]

then approximate

\[
T_V=\mu\{t:m_V(t)\ge0\}
\]

by linearly interpolating threshold crossings between consecutive RK4 output states. The interface now reports both duration in hours and the horizon-normalized fraction.

### F2 — Service-violation fraction used sample counting

**Severity:** High scientific semantics

The same issue affected time below the composite service floor.

**Correction:** service-violation duration is now computed from threshold-crossing time interpolation and reported as hours plus fraction of the horizon.

### F3 — Non-grid-aligned horizons could be numerically stepped beyond the requested terminal time

**Severity:** Medium numerical correctness

**Correction:** the final RK4 step is shortened to `min(dt, T-t)`, so the numerical trajectory terminates exactly at the declared horizon.

### F4 — Inverse experiment UI implied new randomness

**Severity:** Medium reproducibility/communication

The inverse experiment uses a fixed pseudo-random seed. “Regenerate” implied a new noise realization.

**Correction:** it is explicitly labeled a seeded inverse experiment; unchanged controls reproduce the same synthetic observations.

### F5 — Mathematics atlas was mouse-oriented

**Severity:** Medium accessibility

SVG domain nodes were clickable but were not explicitly keyboard-operable.

**Correction:** nodes receive semantic button roles, focusability, Enter/Space activation, focus activation, and descriptive accessible labels.

### F6 — WebGL shader failures were not checked

**Severity:** Medium runtime robustness

**Correction:** shader compile and program-link statuses are checked. Failure produces a visible static mathematical fallback instead of a silent empty canvas.

### F7 — D3 failure could disable the interactive page without a useful visual state

**Severity:** Medium runtime robustness

**Correction:** numerical metrics continue to calculate without D3, and affected SVG regions show explicit dependency-failure fallback text.

### F8 — MathJax used a rolling major-version CDN selector

**Severity:** Medium reproducibility

**Correction:** MathJax is pinned to `3.2.2`; D3 remains pinned to `7.9.0`.

### F9 — Public portfolio linked directly to private repositories

**Severity:** High public UX/professional integrity

The MSE thesis, infrastructure-interface review, and RGAN repositories are private. A public visitor would not have access to those repository pages.

**Correction:** their project descriptions remain public but are explicitly labeled as private-repository work, without links to inaccessible private source locations. The public Africa Energy Dignity repository remains linked directly.

### F10 — Production discoverability/provenance metadata was incomplete

**Severity:** Medium professional/research discoverability

**Correction:** added canonical URL, OpenGraph/Twitter metadata, JSON-LD Person metadata, `robots.txt`, `sitemap.xml`, `404.html`, and `research.json`.

### F11 — Static verification was too shallow

**Severity:** High regression risk

The original verifier mainly checked for required files and a few symbol names.

**Correction:** static verification now also checks mathematical invariants, pinned dependencies, metadata, accessibility/runtime-hardening markers, research epistemic status, crawler configuration and the public/private boundary.

### F12 — Workflow action generation was outdated

**Severity:** Medium CI maintainability

GitHub-hosted runners emitted deprecation warnings for the prior v4 action generation.

**Correction:** verification and production-audit workflows now use `actions/checkout@v7` and `actions/setup-node@v7` while retaining Node.js 22 for the portfolio verification runtime.

## Mathematical regression suite

The expanded model test suite checks nine implementation properties:

1. normalized states remain in `[0,1]`;
2. a non-grid-aligned horizon terminates exactly at `T`;
3. service aggregation respects declared normalized weights;
4. threshold-crossing time integration matches a known linear case;
5. viability and service-violation durations/fractions are internally consistent;
6. additional control improves baseline mean service and nadir;
7. Monte Carlo output is reproducible for a fixed seed;
8. invalid Monte Carlo sample counts are rejected;
9. a synthetic hazard multiplier is recovered by inverse grid search.

These are implementation tests, not empirical model validation.

## Automated production audit

`scripts/production-audit.mjs` checks the deployed site for:

- successful homepage retrieval;
- required visualization mounts;
- required deployed CSS/JS/model/rigor assets;
- mixed-content rejection;
- model/runtime source markers;
- optional hardened metadata enforcement;
- machine-readable `research.json` epistemic status;
- crawler/sitemap configuration;
- warnings for unreachable pinned external D3/MathJax dependencies.

`.github/workflows/production-audit.yml` runs:

- on pull requests;
- on pushes to `main`;
- on manual dispatch;
- daily at 03:17 UTC.

Pull-request/main-push smoke tests focus on deployment availability so GitHub Pages propagation does not create unnecessary metadata-race failures. Scheduled/manual audits enforce the full hardened production metadata after deployment has had time to propagate.

## Remaining scientific boundary

The portfolio remains a **demonstrator**, not a calibrated infrastructure digital twin. The next scientific phase must therefore be calibration/validation rather than adding arbitrary mathematical complexity.

The correct progression is:

\[
\text{verified evidence}
\rightarrow
\text{observation model}
\rightarrow
\text{parameter/interface identification}
\rightarrow
\text{calibration}
\rightarrow
\text{out-of-sample validation}
\rightarrow
\text{uncertainty propagation}
\rightarrow
\text{viability/reachability analysis}.
\]

No production visualization should be relabeled “empirical”, “validated” or “digital twin” until that evidence chain exists.

## Audit status

- Repository/source audit: **PASS on hardening branch**
- Mathematical regression suite: **PASS — 9 implementation tests**
- GitHub-hosted source verification: **PASS on PR #2 corrected head**
- GitHub-hosted production HTTP smoke test: **PASS — live Pages homepage and required deployed assets reachable**
- Full hardened metadata production audit: **automated for manual/scheduled execution after merge**
- Browser pixel-level visual regression: **not yet implemented; not represented as completed**
