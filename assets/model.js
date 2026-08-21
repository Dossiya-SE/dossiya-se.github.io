export const SECTORS = ["Power", "Water", "Transport", "Solid waste"];

export const BASE = Object.freeze({
  recovery: [0.085, 0.072, 0.064, 0.058],
  hazard: [0.125, 0.105, 0.090, 0.080],
  serviceWeights: [0.32, 0.25, 0.25, 0.18],
  controlWeights: [0.34, 0.26, 0.24, 0.16],
  viabilityThresholds: [0.55, 0.55, 0.50, 0.45],
  coupling: [
    [0.000, 0.055, 0.050, 0.020],
    [0.080, 0.000, 0.025, 0.055],
    [0.070, 0.025, 0.000, 0.030],
    [0.060, 0.060, 0.045, 0.000]
  ]
});

const DEFAULTS = Object.freeze({
  horizon: 24,
  dt: 0.04,
  hazardScale: 1,
  couplingScale: 1,
  recoveryScale: 1,
  controlScale: 0.30,
  hazardCenter: 5.5,
  hazardWidth: 2.2,
  serviceFloor: 0.65,
  initialState: [0.96, 0.95, 0.94, 0.92]
});

export function clamp(x, lo = 0, hi = 1) {
  return Math.min(hi, Math.max(lo, x));
}

export function mergeParams(params = {}) {
  return { ...DEFAULTS, ...params };
}

export function hazardEnvelope(t, p) {
  const z = (t - p.hazardCenter) / Math.max(1e-9, p.hazardWidth);
  return 0.18 + 0.82 * Math.exp(-0.5 * z * z);
}

export function derivative(t, x, params = {}) {
  const p = mergeParams(params);
  const env = hazardEnvelope(t, p);
  const dx = new Array(4).fill(0);

  for (let i = 0; i < 4; i += 1) {
    const recovery = BASE.recovery[i] * p.recoveryScale * (1 - x[i]);
    const hazard = BASE.hazard[i] * p.hazardScale * env * x[i];
    const control = p.controlScale * BASE.controlWeights[i] * (1 - x[i]);
    let dependencyPenalty = 0;

    for (let j = 0; j < 4; j += 1) {
      if (i === j) continue;
      dependencyPenalty += BASE.coupling[i][j] * p.couplingScale * x[i] * (1 - x[j]);
    }
    dx[i] = recovery + control - hazard - dependencyPenalty;
  }
  return dx;
}

function addScaled(x, k, scale) {
  return x.map((v, i) => v + scale * k[i]);
}

export function rk4Step(t, x, dt, params = {}) {
  const k1 = derivative(t, x, params);
  const k2 = derivative(t + dt / 2, addScaled(x, k1, dt / 2), params);
  const k3 = derivative(t + dt / 2, addScaled(x, k2, dt / 2), params);
  const k4 = derivative(t + dt, addScaled(x, k3, dt), params);
  return x.map((v, i) => clamp(v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])));
}

export function serviceFromState(x) {
  return x.reduce((acc, value, i) => acc + BASE.serviceWeights[i] * value, 0);
}

export function isViable(x) {
  return x.every((value, i) => value >= BASE.viabilityThresholds[i]);
}

export function simulate(params = {}) {
  const p = mergeParams(params);
  let t = 0;
  let x = p.initialState.map((v) => clamp(v));
  const rows = [{ t, x: [...x], service: serviceFromState(x), viable: isViable(x) }];
  const steps = Math.ceil(p.horizon / p.dt);

  for (let step = 0; step < steps; step += 1) {
    x = rk4Step(t, x, p.dt, p);
    t = Math.min(p.horizon, t + p.dt);
    rows.push({ t, x: [...x], service: serviceFromState(x), viable: isViable(x) });
  }
  return rows;
}

export function trapezoidAverage(rows, key = "service") {
  if (rows.length < 2) return rows[0]?.[key] ?? NaN;
  let area = 0;
  for (let i = 1; i < rows.length; i += 1) {
    const dt = rows[i].t - rows[i - 1].t;
    area += 0.5 * dt * (rows[i - 1][key] + rows[i][key]);
  }
  const horizon = rows.at(-1).t - rows[0].t;
  return horizon > 0 ? area / horizon : rows[0][key];
}

export function summarize(rows, params = {}) {
  const p = mergeParams(params);
  const services = rows.map((d) => d.service);
  const nadir = Math.min(...services);
  const avgService = trapezoidAverage(rows);
  const viableFraction = rows.filter((d) => d.viable).length / rows.length;
  const serviceViolationFraction = rows.filter((d) => d.service < p.serviceFloor).length / rows.length;
  return {
    nadir,
    avgService,
    resilienceIndex: avgService,
    viableFraction,
    serviceViolationFraction,
    finalService: rows.at(-1).service
  };
}

export function mulberry32(seed = 20260821) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function normal01(rng) {
  const u1 = Math.max(rng(), 1e-12);
  const u2 = Math.max(rng(), 1e-12);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export function quantile(values, q) {
  if (!values.length) return NaN;
  const a = [...values].sort((x, y) => x - y);
  const pos = (a.length - 1) * clamp(q, 0, 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return a[lo];
  return a[lo] + (pos - lo) * (a[hi] - a[lo]);
}

export function monteCarlo(baseParams = {}, n = 300, seed = 20260821) {
  const rng = mulberry32(seed);
  const outputs = [];
  for (let k = 0; k < n; k += 1) {
    const hz = Math.exp(0.24 * normal01(rng) - 0.5 * 0.24 ** 2);
    const cp = Math.exp(0.18 * normal01(rng) - 0.5 * 0.18 ** 2);
    const rc = Math.exp(0.12 * normal01(rng) - 0.5 * 0.12 ** 2);
    const p = mergeParams({
      ...baseParams,
      hazardScale: (baseParams.hazardScale ?? 1) * hz,
      couplingScale: (baseParams.couplingScale ?? 1) * cp,
      recoveryScale: (baseParams.recoveryScale ?? 1) * rc
    });
    const summary = summarize(simulate(p), p);
    outputs.push({ ...summary, hazardScale: p.hazardScale, couplingScale: p.couplingScale, recoveryScale: p.recoveryScale });
  }
  const nadirs = outputs.map((d) => d.nadir);
  return {
    outputs,
    pFailure: outputs.filter((d) => d.nadir < mergeParams(baseParams).serviceFloor).length / n,
    q05: quantile(nadirs, 0.05),
    q50: quantile(nadirs, 0.50),
    q95: quantile(nadirs, 0.95)
  };
}

export function interpolateService(rows, t) {
  if (t <= rows[0].t) return rows[0].service;
  if (t >= rows.at(-1).t) return rows.at(-1).service;
  let lo = 0;
  let hi = rows.length - 1;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (rows[mid].t <= t) lo = mid;
    else hi = mid;
  }
  const a = rows[lo];
  const b = rows[hi];
  const w = (t - a.t) / (b.t - a.t);
  return a.service + w * (b.service - a.service);
}

export function estimateHazardScale(observations, baseParams = {}, grid = null) {
  const candidates = grid ?? Array.from({ length: 81 }, (_, i) => 0.4 + i * 0.02);
  const curve = candidates.map((alpha) => {
    const rows = simulate({ ...baseParams, hazardScale: alpha });
    const sse = observations.reduce((acc, obs) => {
      const residual = obs.y - interpolateService(rows, obs.t);
      return acc + residual * residual;
    }, 0);
    return { alpha, sse };
  });
  const best = curve.reduce((a, b) => (b.sse < a.sse ? b : a));
  return { best, curve };
}
