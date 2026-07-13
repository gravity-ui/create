# templates/

- New generated file uses Node APIs but isn't under `src/server` (which gets node globals via `serverConfig`)? Add it to `eslint.config.js.hbs`'s `files: [...]` block (gate by right `{{#if}}`) — else `no-undef`/`process is not defined`.
- Check blank-line/conditional rendering across flag combos: `npm run precompile-templates`, then use root AGENTS.md's one-off `.ts` runner to import the compiled `.hbs.ts` default with different context objects. Faster than eyeballing `.hbs` source.
- Never name a `.hbs` file so precompiled output contains `.d.ts` mid-filename (e.g. `assets.d.ts.hbs` → `assets.d.ts.hbs.ts`) — tsc treats it as ambient, silently skips emit. Fix: avoid substring in source name (e.g. `assets.d-ts.hbs`). Detect: diff `find src/generators/templates -name '*.hbs'` vs `find lib/generators/templates -name '*.js'` after build.
