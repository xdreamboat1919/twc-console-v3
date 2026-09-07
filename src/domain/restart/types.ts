/** Domain types for the account restart plan. Pure data, no DOM. */

/** A product lane in the restart. */
export type Lane = 'skincare' | 'kit';

/** Why the account was restricted. Determines which products are safe to restart on. */
export type RestrictionCause =
  | 'unknown'
  | 'prescription-or-gated'
  | 'destination'
  | 'supplement-claim'
  | 'verification';

export interface LaneConfig {
  readonly lane: Lane;
  /** Target cost per acquisition in account currency. */
  readonly targetCpa: number;
  /** Number of ABO concept cells in the campaign. */
  readonly cells: number;
}

export interface CellEconomics {
  /** Daily budget for the whole product campaign. */
  readonly daily: number;
  /** Daily budget for a single cell. */
  readonly perCell: number;
  /** Expected orders per cell per week at the target CPA. */
  readonly weeklyOrders: number;
  /**
   * Cells this budget could fund at the planning benchmark.
   * A planning figure, not a guarantee of delivery.
   */
  readonly maxCells: number;
  readonly clearsBenchmark: boolean;
}

export interface RampStep {
  readonly week: number;
  readonly dailyPerProduct: number;
  /** Increase over the previous step, as a fraction. Null on the first step. */
  readonly increaseFromPrevious: number | null;
}

export interface RampSummary {
  readonly steps: readonly RampStep[];
  /** Total spend across both products over the given number of days. */
  readonly spendOverDays: number;
}

/** The four day-90 gate conditions. All must hold. */
export interface GateEvidence {
  readonly consecutiveDaysAtTarget: number;
  readonly reconciliationDeltaPct: number;
  readonly validatedCreativesPerProduct: number;
  readonly disapprovals: number;
  readonly dailyHealthRecords: number;
}

export interface GateCondition {
  readonly id: string;
  readonly label: string;
  readonly met: boolean;
  readonly detail: string;
}

export interface GateResult {
  readonly conditions: readonly GateCondition[];
  readonly passed: boolean;
  readonly failed: readonly GateCondition[];
}
