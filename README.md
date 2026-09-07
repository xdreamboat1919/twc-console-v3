# TWC Campaign Console

A private, manual-first performance marketing operating system. The v2
workspace uses React and Tailwind CSS, keeps its working data on the local
machine, and has no hosted backend or live platform integrations.

## Quick start

```bash
npm ci
npm run dev          # http://127.0.0.1:8000
```

Use Node 20.19 or newer. The console is intended to run locally rather than as
a public GitHub Pages site.

### Local AI chat

The campaign copilot calls [Ollama](https://ollama.com/) at
`http://127.0.0.1:11434` by default. Install Ollama and download a local model
such as `llama3.2` before using the chat. The model and endpoint can be changed
without committing secrets:

```bash
VITE_OLLAMA_URL=http://127.0.0.1:11434
VITE_OLLAMA_MODEL=llama3.2
```

The chat gracefully explains what to do when the local model is unavailable.

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
  main.tsx           React entry
  app/               dashboard shell and reusable dashboard components
  platform/          local AI and browser-specific boundaries
  domain/            pure decision logic · tested · no DOM
  features/          feature state retained during migration
  services/          store, session, data-source
  styles/            Tailwind entry point and legacy styles
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
