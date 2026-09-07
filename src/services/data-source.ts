/**
 * The integration boundary.
 *
 * Everything is manual entry today. A future authenticated backend adds adapters
 * here without moving credentials into the browser or touching the decision
 * modules in src/domain.
 */

export type SourceMode = 'manual' | 'backend';

export interface DataSource {
  readonly mode: SourceMode;
  readonly describe: () => string;
}

export const manualSource: DataSource = {
  mode: 'manual',
  describe: () => 'Manual entry. No live platform integrations are configured.',
};

let active: DataSource = manualSource;

export const getDataSource = (): DataSource => active;

export function setDataSource(source: DataSource): void {
  active = source;
}
