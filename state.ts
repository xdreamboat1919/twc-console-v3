import type { Lane } from '@domain/restart/types';

export interface RestartState {
  readonly version: 3;
  ramp: number[];
  week: 1 | 2 | 3 | 4;
  cells: number;
  assetsPerCell: number;
  lanes: Record<Lane, { name: string; targetCpa: number }>;
}

export const defaults = (): RestartState => ({
  version: 3,
  ramp: [600, 900, 1200, 1500],
  week: 4,
  cells: 4,
  assetsPerCell: 6,
  lanes: {
    skincare: { name: 'Skincare hero', targetCpa: 35 },
    kit: { name: 'Non-Rx preparedness kit', targetCpa: 90 },
  },
});

let state: RestartState = defaults();

export const getState = (): Readonly<RestartState> => state;

export function patch(next: Partial<RestartState>): RestartState {
  state = { ...state, ...next };
  return state;
}

/** Migrates a v2 record. Unknown shapes fall back to defaults rather than throwing. */
export function migrate(raw: unknown): RestartState {
  if (typeof raw !== 'object' || raw === null) return defaults();
  const r = raw as Record<string, unknown>;
  const base = defaults();
  return {
    ...base,
    ramp:
      Array.isArray(r.ramp) && r.ramp.every((v) => typeof v === 'number')
        ? (r.ramp as number[])
        : base.ramp,
    assetsPerCell:
      typeof r.assetsPerCell === 'number' &&
      r.assetsPerCell >= 4 &&
      r.assetsPerCell <= 12 &&
      r.assetsPerCell % 2 === 0
        ? r.assetsPerCell
        : base.assetsPerCell,
  };
}
