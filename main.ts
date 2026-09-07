import './styles/foundation.css';
import './styles/shell.css';
import './styles/components.css';
import './styles/pipeline.css';
import './styles/production.css';
import './styles/competitors.css';

import { byId } from '@core/dom';
import * as restart from '@features/restart';
import { type Route, createRouter } from './app/router.js';

const routes: readonly Route[] = [restart.route];

const mounts: Record<string, (host: HTMLElement) => void> = {
  [restart.route.id]: restart.mount,
};

function boot(): void {
  const nav = byId('nav');
  nav.innerHTML = routes
    .map((r) => `<a href="#${r.id}" data-route="${r.id}">${r.label}</a>`)
    .join('');

  const router = createRouter(routes, (id) => {
    const host = document.querySelector<HTMLElement>(`[data-view="${id}"]`);
    if (host) mounts[id]?.(host);
  });

  router.start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
