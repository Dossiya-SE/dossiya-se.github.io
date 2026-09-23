import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PT_LIMITS,
  simulatePT,
  summarizePT,
  signedViabilityMargin,
  metricViabilityMargin
} from '../assets/research-dynamics.js';

test('Power–Transportation reduced model remains bounded', () => {
  const rows = simulatePT();
  assert.ok(rows.length > 100);
  for (const row of rows) {
    assert.ok(row.power >= 0 && row.power <= 1);
    assert.ok(row.transport >= 0 && row.transport <= 1);
    assert.ok(row.service >= 0 && row.service <= 1);
  }
});

test('higher hazard reduces service nadir for fixed coupling/control', () => {
  const low = summarizePT(simulatePT({ hazard:0.6, coupling:0.8, control:0.3 }));
  const high = summarizePT(simulatePT({ hazard:1.6, coupling:0.8, control:0.3 }));
  assert.ok(high.nadir < low.nadir);
});

test('higher recovery control improves nadir for fixed hazard/coupling', () => {
  const low = summarizePT(simulatePT({ hazard:1.3, coupling:0.8, control:0.0 }));
  const high = summarizePT(simulatePT({ hazard:1.3, coupling:0.8, control:0.8 }));
  assert.ok(high.nadir > low.nadir);
});

test('viability margin is positive inside and zero outside Ksvc', () => {
  assert.ok(signedViabilityMargin(0.8,0.8,1) > 0);
  assert.equal(metricViabilityMargin(0.40,0.80,1),0);
  assert.equal(metricViabilityMargin(0.80,0.40,1),0);
  assert.ok(PT_LIMITS.serviceMin > PT_LIMITS.powerMin);
});

test('anisotropic metric changes distance while preserving membership sign', () => {
  const p=0.76, m=0.70;
  const e=signedViabilityMargin(p,m,1);
  const g=signedViabilityMargin(p,m,1.8);
  assert.ok(e > 0 && g > 0);
  assert.notEqual(Number(e.toFixed(8)),Number(g.toFixed(8)));
});
