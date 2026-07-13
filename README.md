<!--
  GENERATED FILE — do not edit README.md directly, edit scripts/readme/readme.hbs instead.
  Regenerate with `npm run generate-readme`.
-->

# @gravity-ui/create

> Scaffold a Gravity UI stack project in seconds.

## Quick start

```bash
npm create @gravity-ui
```

## Flags

**Project options**

| Flag | Description |
| --- | --- |
| `--out <path>` | Destination folder for the new project |
| `--language <ts|js>` | Project language (ts|js) |
| `--frontend, --no-frontend` | Include frontend setup |
| `--styles, --no-styles` | Include stylelint (requires --frontend) |
| `--react, --no-react` | Include React + JSX transform (requires --frontend) |
| `--backend, --no-backend` | Include nodekit backend |
| `--registry <url>` | Custom npm registry |

**Mode options**

| Flag | Description |
| --- | --- |
| `-y, --yes` | Accept defaults, skip prompts |
| `--dry-run` | Show what would be generated without writing files |

**Other**

| Flag | Description |
| --- | --- |
| `-h, --help` | Show this help and exit |
| `-v, --version` | Print version and exit |


## Examples

```bash
npm create @gravity-ui
```

fully interactive

```bash
npm create @gravity-ui -- --out my-app
```

specify path

```bash
npm create @gravity-ui -- --out my-package --language ts --no-frontend --no-backend -y
```

basic TypeScript package

```bash
npm create @gravity-ui -- --out my-api --language ts --no-frontend --backend -y
```

TypeScript backend service

```bash
npm create @gravity-ui -- --out my-app --dry-run
```

preview without writing

## What gets generated

Three shapes: app-builder layout (frontend and/or backend selected), plain TS entry (neither, `ts`), plain JS entry (neither, `js`).

**App-builder layout.** Worked example below is `ts` / backend / frontend + styles + react (all features on); annotations mark what's conditional:

```
.
|-- .gitignore
|-- .prettierrc.js
|-- .stylelintrc.json          # only with styles
|-- README.md
|-- app-builder.config.ts
|-- eslint.config.mjs
|-- package.json
|-- tsconfig.json              # references ui/ and/or server/; both languages
`-- src/
    |-- server/                # only if hasBackend
    |   |-- index.ts           # expresskit+nodekit+app-layout init; ext by language
    |   `-- tsconfig.json
    `-- ui/                    # only if frontend enabled
        |-- tsconfig.json
        |-- entries/
        |   `-- my-app-app.tsx # entry (>=1 allowed); name from project; ext/case by react+language
        |-- components/       # only if react enabled
        |   |-- index.ts      # re-exports App; ext by language
        |   `-- App/
        |       `-- App.tsx   # demo component; ext by language
        `-- types/
            `-- assets.d.ts   # only ts+react
```

**Neither frontend nor backend, TypeScript** — plain `src/index.ts`, no app-builder, straight `tsc` compile.

**Neither frontend nor backend, JavaScript** — plain `index.js` at project root.

## Requirements

Node.js `^22.13.0 || >=23.5.0`.
