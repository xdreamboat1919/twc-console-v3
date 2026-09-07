import { queryAll } from '@core/dom';

export interface Route {
  readonly id: string;
  readonly label: string;
  readonly group: string;
}

export type RouteHandler = (id: string) => void;

export function createRouter(routes: readonly Route[], onNavigate: RouteHandler) {
  const ids = new Set(routes.map((r) => r.id));
  const fallback = routes[0]?.id ?? '';

  const resolve = (): string => {
    const hash = location.hash.replace(/^#/, '');
    return ids.has(hash) ? hash : fallback;
  };

  const apply = () => {
    const id = resolve();
    for (const view of queryAll<HTMLElement>('[data-view]')) {
      view.hidden = view.dataset.view !== id;
    }
    for (const link of queryAll<HTMLAnchorElement>('[data-route]')) {
      link.setAttribute('aria-current', link.dataset.route === id ? 'page' : 'false');
    }
    onNavigate(id);
  };

  return {
    start(): void {
      window.addEventListener('hashchange', apply);
      apply();
    },
    go(id: string): void {
      location.hash = ids.has(id) ? id : fallback;
    },
    current: resolve,
  };
}
