# Architecture

## The rule

**Dependencies point inward. Nothing points out of `domain`.**

```
main.ts
  └── app/          router, shell, boot
        └── features/    state + rendering, thin
              ├── core/      dom, format
              ├── services/  store, session, data-source
              └── domain/    pure decision logic  ← depends on nothing
```

`scripts/validate.mjs` enforces this. A domain file importing from `@features`,
`@services` or `@core` fails CI.

## Why domain is separate

The functions that decide things are also the functions most likely to be wrong,
and they were previously interleaved with HTML string construction. Separating
them makes them testable, reviewable and reusable by a future backend.

`cellEconomics` decides whether a cell clears the planning benchmark. It is
fourteen lines, has no DOM, and has fifteen tests. That is the intended shape.

## Layer contracts

| Layer | May import | Must not | Tested |
|---|---|---|---|
| `domain/` | Nothing outside itself | DOM, storage, network, globals | Required, colocated |
| `core/` | Nothing outside itself | Feature or domain logic | Where behaviour is non-trivial |
| `services/` | `core` | Feature logic | At the boundary |
| `features/` | `core`, `services`, `domain` | Other features | State and migration |
| `app/` | Everything | — | Smoke only |

## Domain purity

The validator rejects `document.`, `window.`, `localStorage.`, `indexedDB.` and
`fetch(` inside `domain/`. The check matches usage rather than the bare word, so
prose such as "attribution window" in a comment does not trip it.

## Persistence

`services/store.ts` owns IndexedDB and checkpoints. `services/session.ts` owns the
portable export schema. Features declare what they persist; neither service knows
what a restart cell is.

**When a persisted shape changes, add a migration.** `features/restart/state.ts`
shows the pattern: unknown input falls back to defaults rather than throwing, and
the migration is tested against malformed data.

## Adding a feature

1. `src/domain/<area>/<thing>.ts` plus `<thing>.test.ts` — the decision logic.
2. `src/features/<name>/state.ts` — state, defaults, migration.
3. `src/features/<name>/view.ts` — rendering, importing from domain.
4. `src/features/<name>/index.ts` — exports `route` and `mount`.
5. Register in `src/main.ts` and add the `data-view` section to `index.html`.
6. `npm run verify`.

## Deliberate omissions

**No framework.** A million lines of working vanilla is worth more than a rewrite.

**No state library.** Feature-local state with explicit migration is sufficient
and is one fewer thing to learn.

**No CSS framework.** The existing stylesheets are sound and carry the design
system already.
