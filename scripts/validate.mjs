#!/usr/bin/env node
/**
 * Structural checks that a type checker and a test runner cannot make.
 * Run in CI on every pull request.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SRC = join(ROOT, 'src');
const MAX_LINE = 140;
const failures = [];
const fail = (msg) => failures.push(msg);

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else out.push(path);
  }
  return out;
}

const files = await walk(SRC);
const ts = files.filter((f) => f.endsWith('.ts'));
const rel = (f) => relative(ROOT, f);
const srcRel = (f) => relative(SRC, f).replaceAll('\\', '/');
const isDomainFile = (f) => srcRel(f).startsWith('domain/');

/** 1 · Line length. Prevents the 51KB single line returning. */
for (const file of ts) {
  const lines = (await readFile(file, 'utf8')).split('\n');
  lines.forEach((line, i) => {
    if (line.length > MAX_LINE)
      fail(`${rel(file)}:${i + 1} line is ${line.length} chars (max ${MAX_LINE})`);
  });
}

/** 2 · The domain layer stays pure. No DOM, no globals, no side effects. */
const FORBIDDEN = [
  /\bdocument\s*[.[]/,
  /\bwindow\s*[.[]/,
  /\blocalStorage\s*[.[]/,
  /\bindexedDB\s*[.[]/,
  /\bfetch\s*\(/,
];
for (const file of ts.filter(isDomainFile)) {
  const src = await readFile(file, 'utf8');
  for (const pattern of FORBIDDEN) {
    if (pattern.test(src))
      fail(`${rel(file)} references ${pattern.source} — domain must stay pure`);
  }
}

/** 3 · Import direction. Domain may not depend on features, services or core. */
const importsOf = (src) => [...src.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
for (const file of ts.filter(isDomainFile)) {
  for (const spec of importsOf(await readFile(file, 'utf8'))) {
    if (/^@(features|services|core)\//.test(spec) || spec.includes('../../features')) {
      fail(`${rel(file)} imports ${spec} — domain must not depend on outer layers`);
    }
  }
}

/** 4 · Every domain module has a colocated test. */
for (const file of ts) {
  if (!isDomainFile(file) || file.endsWith('.test.ts')) continue;
  if (/(types|index)\.ts$/.test(file)) continue;
  if (!ts.includes(file.replace(/\.ts$/, '.test.ts'))) fail(`${rel(file)} has no colocated test`);
}

/** 5 · Import graph is acyclic. */
const graph = new Map();
for (const file of ts) {
  graph.set(
    file,
    importsOf(await readFile(file, 'utf8'))
      .filter((s) => s.startsWith('.'))
      .map((s) => resolve(file, '..', s.replace(/\.js$/, '.ts')))
      .filter((p) => ts.includes(p)),
  );
}
const state = new Map();
const visit = (node, stack) => {
  if (state.get(node) === 'done') return;
  if (state.get(node) === 'open') {
    fail(`import cycle: ${[...stack, node].map(rel).join(' -> ')}`);
    return;
  }
  state.set(node, 'open');
  for (const next of graph.get(node) ?? []) visit(next, [...stack, node]);
  state.set(node, 'done');
};
for (const file of ts) visit(file, []);

/** 6 · Nav routes have a matching view element. */
const html = await readFile(join(ROOT, 'index.html'), 'utf8');
const views = new Set([...html.matchAll(/data-view="([^"]+)"/g)].map((m) => m[1]));
let main;
let isReactEntry = false;
try {
  main = await readFile(join(SRC, 'main.tsx'), 'utf8');
  isReactEntry = true;
} catch {
  main = await readFile(join(SRC, 'main.ts'), 'utf8');
}
if (isReactEntry) {
  if (!main.includes('App')) fail('React entry point does not mount the application shell');
} else {
  for (const [, id] of main.matchAll(/route\.id\]:\s*(\w+)\.mount/g)) void id;
  for (const view of views) {
    if (!main.includes(view) && !ts.some((f) => srcRel(f).startsWith(`features/${view}/`))) {
      fail(`view "${view}" has no matching feature module`);
    }
  }
}

if (failures.length) {
  console.error(`\n${failures.length} problem${failures.length === 1 ? '' : 's'}:\n`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(
  `Validated ${ts.length} TypeScript files, ${views.size} views, import direction, acyclicity and domain purity.`,
);

