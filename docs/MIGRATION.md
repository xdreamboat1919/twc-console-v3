# Migrating the remaining modules

Twenty-three legacy feature files remain in the previous structure. They work.
Move them one at a time, on their own pull request, with the validator green
between each.

## Order

Migrate by decision density, not by file size. A module holding thresholds and
verdicts is worth more converted than one that mostly renders tables.

| Priority | Legacy file | Extract to domain | Why first |
|---|---|---|---|
| 1 | `restart.js` | ✅ done | Cell economics, gate, ramp |
| 2 | `optimization.js` | `domain/scaling/` | Marginal CPA, budget steps |
| 3 | `measurement.js` | `domain/measurement/` | Reconciliation, dedup, match quality |
| 4 | `diagnostics.js` | `domain/diagnostics/` | 48 situation graph |
| 5 | `growth-lab.js` | `domain/creative/` | Verdicts, fatigue, supply |
| 6 | `insights.js` | `domain/attribution/` | Windows, incrementality |
| 7 | `operations.js` | `domain/reporting/` | Holds the 51KB line — reformat first |
| 8 | remainder | as found | Mostly rendering |

## Per-module procedure

**One. Reformat the legacy file in isolation.**

```bash
npx biome check --write assets/js/features/<name>.js
node scripts/validate.mjs
```

Behaviour-preserving. Commit alone, review by running the validator rather than
reading the diff.

**Two. Identify the pure functions.** Anything computing a number, a threshold or
a verdict, with no `document` reference. Those move to `domain/`.

**Three. Write the tests before moving the code.** Assert current behaviour first,
including anything that looks wrong. A migration that silently changes a threshold
is worse than one that preserves a bug you can then fix deliberately.

**Four. Move, adapt, delete.** Extract to `domain/`, rewrite the feature to import
it, delete the legacy file, remove its `<script>` tag.

**Five. `npm run verify`.**

## Rules

**Do not fix behaviour during a migration.** Preserve it, land it, then change it
in a separate commit with its own test. Mixing the two makes both unreviewable.

**Do not migrate two modules in one pull request.**

**Keep the legacy file until its replacement is green in CI.** Delete in the same
commit that removes the script tag.

## Handling the 51KB line

`operations.js` contains a single 50,973-character line. Do not attempt to read
it. Run the formatter, commit that alone, then work with the result.

## Progress

| Module | Formatted | Domain extracted | Feature migrated | Legacy removed |
|---|---|---|---|---|
| restart | ✅ | ✅ | ✅ | ✅ |
| optimization | ☐ | ☐ | ☐ | ☐ |
| measurement | ☐ | ☐ | ☐ | ☐ |
| diagnostics | ☐ | ☐ | ☐ | ☐ |
| growth-lab | ☐ | ☐ | ☐ | ☐ |
| insights | ☐ | ☐ | ☐ | ☐ |
| operations | ☐ | ☐ | ☐ | ☐ |
