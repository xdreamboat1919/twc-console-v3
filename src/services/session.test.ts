import { describe, expect, it } from 'vitest';
import { SESSION_VERSION, buildSession, parseSession } from './session.js';

describe('buildSession', () => {
  it('stamps the current version and an ISO timestamp', () => {
    const s = buildSession({ restart: { cells: 4 } });
    expect(s.version).toBe(SESSION_VERSION);
    expect(() => new Date(s.exportedAt).toISOString()).not.toThrow();
  });
});

describe('parseSession', () => {
  it('accepts a well-formed file', () => {
    const raw = JSON.stringify(buildSession({ restart: {} }));
    const r = parseSession(raw);
    expect(r.ok).toBe(true);
    expect(r.problems).toHaveLength(0);
  });

  it('reports rather than throws on invalid JSON', () => {
    const r = parseSession('{ not json');
    expect(r.ok).toBe(false);
    expect(r.problems[0]).toContain('valid JSON');
  });

  it('rejects a file from a newer build', () => {
    const raw = JSON.stringify({ version: SESSION_VERSION + 1, collections: { a: 1 } });
    const r = parseSession(raw);
    expect(r.ok).toBe(false);
    expect(r.problems.join(' ')).toContain('newer than this build');
  });

  it('reports an empty session rather than silently importing nothing', () => {
    const r = parseSession(JSON.stringify({ version: SESSION_VERSION, collections: {} }));
    expect(r.ok).toBe(false);
    expect(r.problems).toContain('No collections found');
  });

  it('rejects a non-object payload', () => {
    expect(parseSession('[]').ok).toBe(false);
    expect(parseSession('null').ok).toBe(false);
  });
});
