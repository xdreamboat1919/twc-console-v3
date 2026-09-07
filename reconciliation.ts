/**
 * Platform against back end.
 *
 * A delta under fifteen percent is normal attribution difference: the platform
 * answers how many purchases it influenced, the back end answers how many
 * transactions happened. Both are correct and they will not agree.
 */

export interface ReconciliationInput {
  readonly platformOrders: number;
  readonly platformRevenue: number;
  readonly backendOrders: number;
  readonly backendRevenue: number;
}

export type ReconciliationStatus = 'normal' | 'investigate' | 'counting-fault';

export interface ReconciliationResult {
  readonly orderDeltaPct: number;
  readonly revenueDeltaPct: number;
  /** Gap between the two deltas. A large gap points at value or currency. */
  readonly divergencePct: number;
  readonly status: ReconciliationStatus;
  readonly likelyCause: string;
}

export const NORMAL_DELTA_PCT = 15;
export const FAULT_DELTA_PCT = 30;
export const DIVERGENCE_PCT = 10;

const pctDelta = (a: number, b: number): number => (b === 0 ? 0 : ((a - b) / b) * 100);

export function reconcile(i: ReconciliationInput): ReconciliationResult {
  const orderDeltaPct = pctDelta(i.platformOrders, i.backendOrders);
  const revenueDeltaPct = pctDelta(i.platformRevenue, i.backendRevenue);
  const divergencePct = Math.abs(revenueDeltaPct - orderDeltaPct);
  const magnitude = Math.abs(orderDeltaPct);

  if (divergencePct > DIVERGENCE_PCT) {
    return {
      orderDeltaPct,
      revenueDeltaPct,
      divergencePct,
      status: 'investigate',
      likelyCause:
        'Order and revenue deltas diverge. This is a value or currency fault rather than a counting one.',
    };
  }

  if (magnitude > FAULT_DELTA_PCT) {
    return {
      orderDeltaPct,
      revenueDeltaPct,
      divergencePct,
      status: 'counting-fault',
      likelyCause:
        'Beyond attribution difference. Check deduplication on every event, ' +
        'subscription renewals firing the purchase event, and conversions ' +
        'firing before fulfilment.',
    };
  }

  if (magnitude > NORMAL_DELTA_PCT) {
    return {
      orderDeltaPct,
      revenueDeltaPct,
      divergencePct,
      status: 'investigate',
      likelyCause: 'Outside the normal band. Confirm window, timezone and deduplication first.',
    };
  }

  return {
    orderDeltaPct,
    revenueDeltaPct,
    divergencePct,
    status: 'normal',
    likelyCause:
      'Within normal attribution difference. The two systems answer different questions.',
  };
}
