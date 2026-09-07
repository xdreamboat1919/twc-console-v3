/**
 * Portable session export and import.
 *
 * Browser storage belongs to the origin that created it, so a new Codespace URL
 * is a new origin with empty storage. The session file is how state moves.
 */

export const SESSION_VERSION = 3;

export interface SessionFile {
  readonly version: number;
  readonly exportedAt: string;
  readonly collections: Readonly<Record<string, unknown>>;
}

export interface ImportResult {
  readonly ok: boolean;
  readonly version: number | null;
  readonly collections: Readonly<Record<string, unknown>>;
  readonly problems: readonly string[];
}

export function buildSession(collections: Record<string, unknown>): SessionFile {
  return {
    version: SESSION_VERSION,
    exportedAt: new Date().toISOString(),
    collections,
  };
}

/**
 * Parses a session file defensively. A malformed file reports problems rather
 * than throwing, so a bad import cannot destroy the current workspace.
 */
export function parseSession(raw: string): ImportResult {
  const problems: string[] = [];
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, version: null, collections: {}, problems: ['File is not valid JSON'] };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return {
      ok: false,
      version: null,
      collections: {},
      problems: ['File is not a session object'],
    };
  }

  const file = parsed as Record<string, unknown>;
  const version = typeof file.version === 'number' ? file.version : null;

  if (version === null) problems.push('Missing version field');
  else if (version > SESSION_VERSION) {
    problems.push(`File version ${version} is newer than this build supports (${SESSION_VERSION})`);
  }

  const collections =
    typeof file.collections === 'object' && file.collections !== null
      ? (file.collections as Record<string, unknown>)
      : {};

  if (Object.keys(collections).length === 0) problems.push('No collections found');

  return { ok: problems.length === 0, version, collections, problems };
}

export function download(session: SessionFile, filename?: string): void {
  const name = filename ?? `twc-console-${session.exportedAt.slice(0, 10)}.json`;
  const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
