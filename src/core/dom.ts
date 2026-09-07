export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  return el as T;
}

export function query<T extends Element = Element>(
  selector: string,
  root: ParentNode = document,
): T | null {
  return root.querySelector<T>(selector);
}

export function queryAll<T extends Element = Element>(
  selector: string,
  root: ParentNode = document,
): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

/** Delegated listener. Returns a disposer so views can clean up. */
export function on<K extends keyof HTMLElementEventMap>(
  root: HTMLElement,
  type: K,
  selector: string,
  handler: (event: HTMLElementEventMap[K], target: HTMLElement) => void,
): () => void {
  const listener = (event: Event) => {
    const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(selector);
    if (target && root.contains(target)) handler(event as HTMLElementEventMap[K], target);
  };
  root.addEventListener(type, listener);
  return () => root.removeEventListener(type, listener);
}
