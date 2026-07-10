---
name: writing-unit-tests
description: Use when writing or editing *.test.ts files in this repo (@gravity-ui/create).
---

# Writing Unit Tests (gravity-ui/create)

## Overview

Reference skill distilled from this repo's AGENTS.md files. Native `node:test`, colocated `*.test.ts`, never touch real disk.

## Quick Reference

| Rule | Why |
|---|---|
| Use `test.describe` + `test(name, (t: TestContext) => ...)` with `t.assert.*` | Not top-level `node:assert/strict` + nested `await t.test()` — lint/prettier normalizes to the former anyway |
| Colocate `foo.test.ts` next to `foo.ts` | Repo convention, no `__tests__` dirs |
| Generators: never call real `node:fs` | Always take a `FileSystem` param; tests pass `memfs.ts` |
| Generator tests: `runGenerators({dryRun: true})`, assert on captured files | Never write to real disk in a test |
| `nvm use && npm test` after any behavior change | `.nvmrc` pins Node; wrong Node breaks the TS loader |
| Chicago school: assert on state (captured files, return values), not call-args | London-style interaction mocks aren't used anywhere in this repo's tests |

## Chicago school (state-based), not London (interaction-based)

Verify state/output of the code under test, not "was function X called with args Y" on its collaborators. Concretely in this repo:

- `mock.module('node:fs', ...)` in `destination.test.ts` mocks a builtin, but still fits Chicago school: it substitutes a working fake (backed by `memfs` from the `memfs` npm package) at the one true I/O boundary, and the tests assert on `validateDestination`'s return value (state) — never on whether `existsSync` was called. The distinction is state-vs-interaction verification, not "mocking is banned."
- Don't add call-count/call-args assertions (`t.mock.fn`/`t.mock.method` + `assert(called with...)`) for code that takes a `FileSystem` param — pass a real `memfs` instance and assert on what it captured instead.

## Mocking `node:fs` directly

`eslint.config.js`'s `no-restricted-imports` scopes which file(s) may import `node:fs`/`node:fs/promises` directly — check that rule to find the current file(s). When testing one of those:

`mock.module('node:fs', ...)` only rebinds modules that import the mocked specifier *directly*. Once such a module has been evaluated and its top-level `import {existsSync} from 'node:fs'` linked, `mock.restore()` + a fresh `mock.module()` does **not** rebind it — Node's ESM cache never re-evaluates the module for the same specifier. Remocking per test silently reuses the *first* test's mock in every later test, with no error.

**Working pattern**:
- Mock `node:fs` **once** at module top-level, backed by a single `memfs()` volume.
- Import the module under test once.
- Give each test its own path namespace (`/case-<name>/cwd/...`) inside that shared volume instead of remocking per test.

## Testing pure logic split out of I/O

When a module mixes pure decision logic with unavoidable I/O (terminal prompts, `p.note` formatting), pull the decision logic into a small pure function over plain data and unit-test that directly — e.g. `buildNextSteps(model, cwd)` extracted from `main()` in `src/index.ts`. Don't try to test the I/O wrapper.

## Common Mistakes

- Writing to real disk in a generator test instead of `{dryRun: true}` + memfs.
- Remocking `node:fs` per test instead of once at module top-level.
- Nested `await t.test()` instead of flat `test.describe`/`test`.
- Mocking a direct import of the module under test (e.g. `mock.module`-ing `utils/isModulePackage.js` while testing `generators/base.ts`) instead of driving it with real input data. These are plain functions over the `model`/args already in scope — construct a `model` that produces the branch you want, don't intercept the import.
