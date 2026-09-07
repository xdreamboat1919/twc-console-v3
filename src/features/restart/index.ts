import { renderRestart } from './view.js';

export { defaults, getState, migrate, patch } from './state.js';
export { renderRestart };

export const route = { id: 'restart', label: 'Restart', group: 'Creative Lab' } as const;

export function mount(host: HTMLElement): void {
  host.innerHTML = renderRestart();
}
