# e2e/AGENTS.md

Playwright specs that assert on CLI-scaffolded output rendered in a real browser. Not run by `npm test` — driven by `.github/workflows/e2e.yml`, which builds the CLI, scaffolds one or more throwaway projects into `/tmp`, and points Playwright at whichever one is under test.

## Targeting

- All specs flat in one `testDir` (config) — no per-shape split.
- CI job picks target app by setting `E2E_APP_DIR`/`APP_PORT` before `npx playwright test`, not by pointing at a different testDir.
- Since one unfiltered run would hit every spec against whatever's scaffolded, each spec is tagged `{tag: '@name'}` (e.g. `@frontend-react`/`@frontend-no-react`) and each CI job filters `--grep @tag`. New spec file → add its tag to the right job's grep, else other jobs pick it up and fail.

## What's actually observable per combo (verified by running each, not just reading templates)

`language` and `styles` never affect runtime output — only `hasFrontend`/`hasBackend`/`hasReact` do. That collapses the 20 configs in the root AGENTS.md's parameter matrix to 4 buckets:

| hasFrontend | hasBackend | what you can assert | where |
|---|---|---|---|
| false | false | stdout `Hello, world!` after `npm run build && npm start` | plain entry (`src/index.ts` or root `index.js`), CI `test-cli` job — **ts only, no js coverage** |
| false | true | HTTP body is the literal string `Hello, world!`, **no HTML markup at all** despite `Content-Type: text/html` — verified via curl. A Playwright `h1` locator finds nothing; must assert raw body text | not covered by any CI job |
| true | false | **nothing app-related to assert.** `npm run dev` (`app-builder dev --target client`) only builds the JS bundle to `dist/public/build/`; hitting `/` in a browser gets webpack-dev-server's raw directory listing, not the app — there's no HTML shell without a backend to render `@gravity-ui/app-layout` | not covered, not coverable as scaffolded |
| true | true | `GET /` renders the `@gravity-ui/app-layout` shell with a real `h1` — assert via `assertHeading` fixture (below). Text is `Hello, Gravity UI!` for `--react`, `Hello, world!` for `--no-react`; `--styles` never changes it | CI: `test-e2e-browser` (react, ts only) + `test-e2e-no-react` (no-react, ts **and** js) |

Gaps if adding coverage: no js-language run of the CLI-stdout or react-frontend jobs, and the backend-only / frontend-only buckets have no test at all.

## `--out` must resolve inside the invoking process's cwd

`validateDestination` (`src/utils/destination.ts`) rejects `--out` resolving outside cwd. So `.github/workflows/e2e.yml` scaffolds via `working-directory: /tmp` + relative `--out`, calling CLI by absolute `$GITHUB_WORKSPACE/lib/index.js`. Changing either side: check the other didn't break.

## Fixtures

`fixtures.ts` extends Playwright's base `test` with an `assertHeading(expected)` fixture (goto `/` + assert `h1` text). New spec asserting `h1` after `goto('/')`: use `assertHeading`, don't inline goto+expect. Different assertion shape (different element, multiple assertions, no goto): add a new fixture to `fixtures.ts`, not inline boilerplate — specs stay tag + expected value only.
