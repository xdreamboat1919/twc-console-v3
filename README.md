# TWC Campaign Console

A private, manual-first performance marketing operating system. Static
application, no backend, no live platform integrations.

## Quick start

```bash
npm ci
npm run dev          # http://127.0.0.1:8000
```

In GitHub: **Code → Codespaces → Create codespace**. The dev container installs
and starts the console. Confirm port `8000` is **Private**.

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Vite dev server with hot reload |
| `npm test` | Unit tests |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | Biome lint and format check |
| `npm run format` | Apply formatting |
| `npm run validate` | Structural and layering checks |
| `npm run verify` | **Everything CI runs** |

Run `npm run verify` before opening a pull request.

## Architecture

```
src/
  main.ts            entry
  app/               router, shell
  core/              dom, format
  domain/            pure decision logic · tested · no DOM
  features/          state and rendering
  services/          store, session, data-source
  styles/
scripts/validate.mjs
```

Dependencies point inward. Nothing points out of `domain/`, and CI enforces it.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the layer contracts and
[docs/MIGRATION.md](docs/MIGRATION.md) for moving the remaining legacy modules.

## The domain layer

The functions that decide things live in `src/domain` with colocated tests. They
have no DOM access, no storage access and no dependencies on outer layers, which
is what makes them testable and what would let a future backend reuse them.

Findings from the operating plans are encoded as executable assertions rather
than prose. For example, `economics.test.ts` asserts that a four-cell kit
structure never clears the planning benchmark at any point in the ramp, and that
two cells does. That cannot silently regress.

**The 50-orders-per-week figure is a planning benchmark throughout, never a
guarantee of stable delivery or of statistical power.**

## Storage and privacy

Workspace data lives in browser IndexedDB with versioned recovery checkpoints.
**Export a session before deleting a Codespace, clearing storage or changing
machines.** Browser storage belongs to the origin that created it, and a new
Codespace URL is a new origin.

Keep the repository and forwarded port private. Do not enable GitHub Pages.
Never place platform tokens, customer lists or health information in browser
JavaScript or in git history.

## CI

Every pull request runs lint, typecheck, tests with coverage thresholds,
structural validation and a production build. Tags starting with `v` publish a
release artifact.

`src/domain/` is protected by CODEOWNERS. Decision logic does not change without
review.
