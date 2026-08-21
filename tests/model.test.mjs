import test from 'node:test';
import assert from 'node:assert/strict';
import {
  simulate,
  summarize,
  monteCarlo,
  serviceFromState,
  estimateHazardScale,
  interpolateService,
  durationAboveThreshold
} from '../assets/model.js';

test('normalized states remain bounded in [0,1]', () => {
  const rows = simulate({ horizon: 36, hazardScale: 2.1, couplingScale: 1.8, controlScale: 0.05 });
  for (const row of rows) {
    for (const x of row.x) assert.ok(x >= 0 && x <= 1, `state out of bounds: ${x}`);
  }
});

test('simulation terminates exactly at a non-grid-aligned horizon', () => {
  const horizon = 1.03;
  const rows = simulate({ horizon, dt: 0.04 });
  assert.ok(Math.abs(rows.at(-1).t - horizon) < 1e-12, `final t=${rows.at(-1).t}`);
  for (let i = 1; i < rows.length; i += 1) assert.ok(rows[i].t > rows[i - 1].t);
});

test('service aggregation matches declared weights', () => {
  assert.ok(Math.abs(serviceFromState([1, 1, 1, 1]) - 1) < 1e-12);
  assert.ok(Math.abs(serviceFromState([0, 0, 0, 0])) < 1e-12);
});

test('time-above-threshold integration resolves a linear crossing', () => {
  const rows = [
    { t: 0, value: 1 },
    { t: 10, value: 0 }
  ];
  const duration = durationAboveThreshold(rows, (d) => d.value, 0.4);
  assert.ok(Math.abs(duration - 6) < 1e-12, `duration=${duration}`);
});

test('viable and violation fractions are time-measure quantities in [0,1]', () => {
  const rows = simulate({ horizon: 24, hazardScale: 1.5, couplingScale: 1.2, controlScale: 0.2 });
  const summary = summarize(rows, { horizon: 24 });
  assert.ok(summary.viableFraction >= 0 && summary.viableFraction <= 1);
  assert.ok(summary.serviceViolationFraction >= 0 && summary.serviceViolationFraction <= 1);
  assert.ok(Math.abs(summary.viableDuration / 24 - summary.viableFraction) < 1e-10);
  assert.ok(Math.abs(summary.serviceViolationDuration / 24 - summary.serviceViolationFraction) < 1e-10);
});

test('additional recovery control improves mean service in the baseline scenario', () => {
  const low = summarize(simulate({ controlScale: 0.05 }), { controlScale: 0.05 });
  const high = summarize(simulate({ controlScale: 0.70 }), { controlScale: 0.70 });
  assert.ok(high.avgService > low.avgService);
  assert.ok(high.nadir > low.nadir);
});

test('Monte Carlo experiment is reproducible for a fixed seed', () => {
  const a = monteCarlo({ hazardScale: 1.1 }, 40, 77);
  const b = monteCarlo({ hazardScale: 1.1 }, 40, 77);
  assert.deepEqual(a, b);
});

test('invalid Monte Carlo sample count is rejected', () => {
  assert.throws(() => monteCarlo({}, 0, 1), RangeError);
});

test('inverse grid search recovers a synthetic hazard multiplier', () => {
  const truth = 1.28;
  const rows = simulate({ hazardScale: truth });
  const times = [3, 5, 7, 10, 14, 20];
  const observations = times.map((t) => ({ t, y: interpolateService(rows, t) }));
  const result = estimateHazardScale(observations, {});
  assert.ok(Math.abs(result.best.alpha - truth) <= 0.021, `estimate=${result.best.alpha}`);
});
