import test from "node:test";
import assert from "node:assert/strict";
import {
  INITIAL_RESEARCH_STATE,
  ResearchStateStore,
  metricConstraintMargins,
  normalizeResearchState
} from "../assets/research-state.js";

test("initial research state is inside the explicit service set", () => {
  const result = metricConstraintMargins(INITIAL_RESEARCH_STATE);
  assert.equal(result.admissible, true);
  assert.ok(result.signedMetricMargin > 0);
  assert.equal(result.service, 0.75);
});

test("constraint boundary has zero signed metric margin", () => {
  const result = metricConstraintMargins({ p: 0.45, m: 0.75, psi: 1.35 });
  assert.ok(Math.abs(result.signedMetricMargin) < 1e-12);
});

test("anisotropy scales the mobility-floor metric margin", () => {
  const low = metricConstraintMargins({ p: 0.95, m: 0.50, psi: 0.8 });
  const high = metricConstraintMargins({ p: 0.95, m: 0.50, psi: 1.6 });
  assert.ok(high.mobility > low.mobility);
  assert.ok(Math.abs(high.mobility - 2 * low.mobility) < 1e-12);
});

test("normalization clamps states and rejects nonpositive metric anisotropy", () => {
  assert.deepEqual(normalizeResearchState({ p: 2, m: -1, psi: 1 }), { p: 1, m: 0, psi: 1 });
  assert.throws(() => normalizeResearchState({ psi: 0 }), /strictly positive/);
});

test("state store publishes one normalized state to all renderers", () => {
  const store = new ResearchStateStore();
  const seen = [];
  const unsubscribe = store.subscribe((state, source) => seen.push({ state, source }));
  store.update({ p: 0.81 }, "test");
  unsubscribe();
  assert.equal(seen.length, 2);
  assert.equal(seen[1].source, "test");
  assert.equal(seen[1].state.p, 0.81);
  assert.equal(seen[1].state.m, INITIAL_RESEARCH_STATE.m);
});
