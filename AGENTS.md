# AGENTS.md

## What this is

`@gravity-ui/create` — CLI that scaffolds a new project on the gravity-ui stack. Asks a few questions (or reads CLI flags), builds a `ProjectModel`, then runs generators that write files into the chosen destination folder.

## Source layout

- `src/cli` — arg parsing, help/version/dry-run rendering. Flag behavior itself lives in `CliSchema` (see Conventions).
- `src/prompts` — interactive questionnaire (`@clack/prompts`).
- `src/model` — `ProjectModel`: mutable accumulator, built up by prompts, consumed and further mutated by generators.
- `src/generators` — one file per feature. Each generator registers deps/scripts on the model (via `utils/pm.ts`) and writes files through the `FileSystem` abstraction.
  - `templates/` — `.hbs` sources; see `templates/AGENTS.md` for the precompile hook and an eslint-config-specific gotcha.
- `src/utils` — `fs.ts` is the only file eslint allows to import `node:fs`/`node:fs/promises`/`fs` (`no-restricted-imports`, scoped to this one file, covers sync too) — any new fs-touching helper must live here.
- `e2e` — Playwright specs driving CLI-scaffolded output, run via `.github/workflows/e2e.yml`. See `e2e/AGENTS.md`.
- Any `__fixtures__` dir anywhere under `src/` is test-only, excluded from the publish build (`tsconfig.publish.json`'s glob exclude) — never put anything meant to ship in `lib` there.

## Checks

All `npm`/`node`/`npx` commands below MUST be prefixed with `nvm use &&` — wrong Node version breaks the TS loader.

- To run a one-off `.ts` file directly, plain `node file.ts` fails on module resolution — source imports use `.js` extensions (NodeNext) that don't exist on disk. Use: `node --import ./scripts/test-runner-register.js file.ts` (same loader hook `npm test` registers).
- `npm test` — run after any behavior change, always.
- `npm test -- --experimental-test-coverage --test-reporter=lcov --test-reporter-destination=lcov.info --test-coverage-exclude='**/*.test.ts' --test-coverage-exclude='**/__fixtures__/**' --test-coverage-exclude='**/*.hbs.ts' --test-coverage-exclude='**/.*.hbs.ts' --test-coverage-include='src/**'` — coverage report, on demand.
  - **Gap**: node's coverage only instruments files actually `import`ed during the run — an untouched file is silently absent from `lcov.info` (not listed at 0%), inflating the reported %. Find genuinely untested files: diff `find src -name '*.ts' ! -name '*.test.ts' ! -path '*/__fixtures__/*' ! -name '*.hbs.ts'` against `grep '^SF:' lcov.info | sed 's/^SF://'` — anything only on the left was never touched by a test.
- `npx tsc --noEmit` — run after any change, always. Running it directly (vs `npm run typecheck`) skips the `pretypecheck` hook that regenerates `.hbs.ts` — see the `.hbs` note below if templates changed.
- `npm run lint -- --fix` and `npm run lint:prettier` — run once a file is believed done (style pass, not per-edit).
- `npm run knip` — run before declaring work finished, to catch unused exports left behind by a refactor. The dummy `E2E_APP_DIR=.` in its script exists only so knip's Playwright plugin can import `playwright.config.ts` (which throws if unset) — it's never used to actually launch anything.
- `.hbs` templates compile to gitignored `.hbs.ts` (never hand-edit). Regen is hooked into `pretest`/`pretypecheck`/`prebuild`/`preknip`, so `npm test`/`npm run knip` always see fresh output — `npx tsc --noEmit` doesn't, run `npm run precompile-templates` manually first if `.hbs` files changed. See `templates/AGENTS.md`.
- `README.md` is generated (see header comment) — `scripts/generate-readme.test.ts` catches drift.

## Conventions

- **Types**: put `types.ts` next to the code that owns it. Only hoist to a shared parent (`generators/types.ts`, `utils/types.ts`) when colocating would cause a circular import.
- **Filesystem**: generators never touch `node:fs` directly — always take a `FileSystem` param, so `--dry-run` and tests can swap in `memfs` instead of writing to disk.
- **CLI flags**: add fields to `CliSchema` only — parsing, per-flag help text (description/placeholder), and validation all derive from it automatically. Don't hand-wire a new flag into `parseArgs` separately. Known gap: `help.ts`'s `Examples` section is hand-written prose (command strings with literal flag names), not derived from the schema — renaming a flag silently leaves it stale, so grep the old name there too.
- **Tests**: native `node:test` (`npm test`), colocated as `*.test.ts` next to the source under test. See `writing-unit-tests` skill for conventions/gotchas.
- **Style**: never hand-fix styling/formatting (import order, quotes, indentation) — run the lint/prettier commands from `## Checks` instead, even for a single misplaced import.
- **View/logic split for testability**: when a module mixes pure data-building with rendering (e.g. terminal `p.note` formatting), separate the two — e.g. `src/cli/dryRun.ts`'s `buildDryRunSummary` (pure, unit-tested) vs `renderDryRunSummary`/`formatDryRunSummary` (terminal output).
- **Derived flags**: a simple single-field check (e.g. `model.hasBackend`) stays inline. Once a decision needs more than one `ProjectModel` field (e.g. `hasAppBuilder = hasBackend || hasFrontend`), add it to `calculateFlags(model)` (`src/utils/calculateFlags.ts`) instead of a one-off predicate.
- **Generated files**: every JS/TS output file goes through a `.hbs` template — no generator writes JS/TS content directly. JSON files are the exception, built via `writeJson`/`JSON.stringify` instead.

## Generated project structure

See [README.md](./README.md#what-gets-generated) for the three shapes and the app-builder directory layout.

Dev/build scripts pick a side via `--target <client|server>` when only one of ui/server exists.

Plain-JS shape's entry stays at project root, not under `src/`: with no bundler and no frontend/backend, there's no convention to commit to, so it stays at the root instead of guessing a layout.

## Valid parameter combinations

`styles`/`react` are only settable when frontend is enabled — enforced twice: `CliSchema`'s `.refine()` checks (`schema.ts`) and structurally by `runPromptFlow.ts` (styles/react prompts only run `if (model.frontend)`). Keep both in sync if this changes. So the frontend axis collapses to 5 states — `false`, or enabled × `{none, styles-only, react-only, styles+react}` — not a raw 2×2 sub-cross.

Combined with `language` (2) and `hasBackend` (2): **20** distinct configs. `registry` (default vs. custom URL) is an independent axis, only toggling whether `generateBase` writes `.npmrc`. No package-manager (npm/yarn/pnpm) axis exists.

What's actually observable at runtime per combo (browser vs stdout vs nothing), and current e2e coverage gaps: see `e2e/AGENTS.md`.
