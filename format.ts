const nf = new Intl.NumberFormat('en-US');

export function money(n: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export const num = (n: number): string => nf.format(Math.round(n));
export const pct = (n: number, dp = 1): string => `${n >= 0 ? '' : ''}${n.toFixed(dp)}%`;
export const signedPct = (n: number, dp = 1): string => `${n >= 0 ? '+' : ''}${n.toFixed(dp)}%`;

export function escapeHtml(value: unknown): string {
  return String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );
}
