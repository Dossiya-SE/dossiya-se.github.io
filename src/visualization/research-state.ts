export interface ResearchVisualizationState {
  readonly p: number;
  readonly m: number;
  readonly psi: number;
}

export type ConstraintName = "power floor" | "mobility floor" | "composite service";

export interface ConstraintMargins {
  readonly power: number;
  readonly mobility: number;
  readonly composite: number;
  readonly signedMetricMargin: number;
  readonly activeConstraint: ConstraintName;
  readonly service: number;
  readonly admissible: boolean;
}

export const SERVICE_CONSTRAINTS = Object.freeze({
  powerMin: 0.45,
  mobilityMin: 0.45,
  serviceMin: 0.60,
  sumMin: 1.20
});

export const INITIAL_RESEARCH_STATE: ResearchVisualizationState = Object.freeze({
  p: 0.78,
  m: 0.72,
  psi: 1.35
});

const finite = (value: number, label: string): number => {
  if (!Number.isFinite(value)) throw new TypeError(label + " must be finite");
  return value;
};

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, finite(value, "state")));

export function normalizeResearchState(input: Partial<ResearchVisualizationState>): ResearchVisualizationState {
  const p = clamp01(input.p ?? INITIAL_RESEARCH_STATE.p);
  const m = clamp01(input.m ?? INITIAL_RESEARCH_STATE.m);
  const psi = finite(input.psi ?? INITIAL_RESEARCH_STATE.psi, "psi");
  if (psi <= 0) throw new RangeError("psi must be strictly positive");
  return Object.freeze({ p, m, psi });
}

export function metricConstraintMargins(state: ResearchVisualizationState): ConstraintMargins {
  const { p, m, psi } = normalizeResearchState(state);
  const power = p - SERVICE_CONSTRAINTS.powerMin;
  const mobility = psi * (m - SERVICE_CONSTRAINTS.mobilityMin);
  const composite = (p + m - SERVICE_CONSTRAINTS.sumMin) / Math.sqrt(1 + 1 / (psi * psi));
  const candidates: ReadonlyArray<readonly [ConstraintName, number]> = [
    ["power floor", power],
    ["mobility floor", mobility],
    ["composite service", composite]
  ];
  const [activeConstraint, signedMetricMargin] = candidates.reduce((best, item) => item[1] < best[1] ? item : best);
  const service = 0.5 * (p + m);
  return Object.freeze({
    power,
    mobility,
    composite,
    signedMetricMargin,
    activeConstraint,
    service,
    admissible: power >= 0 && mobility >= 0 && composite >= 0
  });
}

export type StateListener = (state: ResearchVisualizationState, source: string) => void;

export class ResearchStateStore {
  #state: ResearchVisualizationState;
  #listeners = new Set<StateListener>();

  constructor(initial: Partial<ResearchVisualizationState> = INITIAL_RESEARCH_STATE) {
    this.#state = normalizeResearchState(initial);
  }

  get value(): ResearchVisualizationState {
    return this.#state;
  }

  update(patch: Partial<ResearchVisualizationState>, source = "unknown"): ResearchVisualizationState {
    this.#state = normalizeResearchState({ ...this.#state, ...patch });
    for (const listener of this.#listeners) listener(this.#state, source);
    return this.#state;
  }

  subscribe(listener: StateListener): () => void {
    this.#listeners.add(listener);
    listener(this.#state, "initial");
    return () => this.#listeners.delete(listener);
  }
}
