import test from 'node:test';
import assert from 'node:assert/strict';
import {
  simulate,
  summarize,
  monteCarlo,
  serviceFromState,
  estimateHazardScale,
  interpolateService
} from '../assets/model.js';

test('normalized states remain bounded in [0,1]', () => {
  const rows = simulate({ horizon: 36, hazardScale: 2.1, couplingScale: 1.8, controlScale: 0.05 });
  for (const row of rows) {
    for (const x of row.x) assert.ok(x >= 0 && x <= 1, `state out of bounds: ${x}`);
  }
});

test('service aggregation matches declared weights', () => {
  assert.ok(Math.abs(serviceFromState([1, 1, 1, 1]) - 1) < 1e-12);
  assert.ok(Math.abs(serviceFromState([0, 0, 0, 0])) < 1e-12);
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

test('inverse grid search recovers a synthetic hazard multiplier', () => {
  const truth = 1.28;
  const rows = simulate({ hazardScale: truth });
  const times = [3, 5, 7, 10, 14, 20];
  const observations = times.map((t) => ({ t, y: interpolateService(rows, t) }));
  const result = estimateHazardScale(observations, {});
  assert.ok(Math.abs(result.best.alpha - truth) <= 0.021, `estimate=${result.best.alpha}`);
});
