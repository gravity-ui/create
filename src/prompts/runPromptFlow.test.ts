import path from 'node:path';
import {type TestContext, test} from 'node:test';

import type {ParsedCli} from '../cli/schema.js';
import {createEmptyModel} from '../model/index.js';

import {runPromptFlow} from './runPromptFlow.js';
import type {Prompter} from './types.js';

function baseCli(overrides: Partial<ParsedCli> = {}): ParsedCli {
    return {
        yes: false,
        'dry-run': false,
        help: false,
        version: false,
        ...overrides,
    };
}

type Answers = {
    text?: Record<string, string>;
    select?: Record<string, unknown>;
    confirm?: Record<string, boolean>;
};

function createFakePrompter(answers: Answers = {}): Prompter {
    return {
        async text(opts) {
            const value = answers.text?.[opts.message];
            if (value === undefined) {
                throw new Error(`Unexpected text prompt: "${opts.message}"`);
            }
            return value;
        },
        async select<T>(opts: {message: string}) {
            if (!answers.select || !(opts.message in answers.select)) {
                throw new Error(`Unexpected select prompt: "${opts.message}"`);
            }
            return answers.select[opts.message] as T;
        },
        async confirm(opts) {
            if (!answers.confirm || !(opts.message in answers.confirm)) {
                throw new Error(`Unexpected confirm prompt: "${opts.message}"`);
            }
            return answers.confirm[opts.message];
        },
        step() {
            // no-op: skip-step logging isn't asserted on
        },
    };
}

test.describe('runPromptFlow', () => {
    test('all CLI flags set: model derived from flags, no prompts fired', async (t: TestContext) => {
        const model = createEmptyModel();
        const cli = baseCli({
            out: './my-app',
            registry: 'https://registry.example.com',
            language: 'ts',
            frontend: true,
            styles: true,
            react: true,
            backend: true,
        });

        await runPromptFlow(model, cli, createFakePrompter());

        t.assert.equal(model.destination, path.resolve(process.cwd(), './my-app'));
        t.assert.equal(model.projectName, path.basename(model.destination));
        t.assert.equal(model.registry, 'https://registry.example.com');
        t.assert.equal(model.language, 'ts');
        t.assert.deepStrictEqual(model.frontend, ['styles', 'react']);
        t.assert.equal(model.hasBackend, true);
    });

    test('--yes with --out: missing flags fall back to YES_DEFAULTS', async (t: TestContext) => {
        const model = createEmptyModel();
        const cli = baseCli({yes: true, out: './my-app'});

        await runPromptFlow(model, cli, createFakePrompter());

        t.assert.equal(model.language, 'ts');
        t.assert.deepStrictEqual(model.frontend, ['styles', 'react']);
        t.assert.equal(model.hasBackend, false);
        t.assert.equal(model.registry, undefined);
    });

    test('--yes without --out throws', async (t: TestContext) => {
        const model = createEmptyModel();
        const cli = baseCli({yes: true});

        await t.assert.rejects(
            () => runPromptFlow(model, cli, createFakePrompter()),
            /Destination is required when --yes is used\./,
        );
    });

    test('--frontend=false skips styles/react entirely', async (t: TestContext) => {
        const model = createEmptyModel();
        const cli = baseCli({yes: true, out: './my-app', frontend: false});

        await runPromptFlow(model, cli, createFakePrompter());

        t.assert.equal(model.frontend, false);
    });

    test('fully interactive flow answers every prompt', async (t: TestContext) => {
        const model = createEmptyModel();
        const cli = baseCli();
        const prompter = createFakePrompter({
            text: {
                'Destination folder': './my-project',
                'Registry URL': 'https://custom.registry',
            },
            confirm: {
                'Use custom npm registry?': true,
            },
            select: {
                Language: 'js',
                'Does your project have a frontend?': true,
                'Will your project have styles?': false,
                'Will your project use React?': true,
                'Will your project have a backend?': true,
            },
        });

        await runPromptFlow(model, cli, prompter);

        t.assert.equal(model.destination, path.resolve(process.cwd(), './my-project'));
        t.assert.equal(model.projectName, path.basename(model.destination));
        t.assert.equal(model.registry, 'https://custom.registry');
        t.assert.equal(model.language, 'js');
        t.assert.deepStrictEqual(model.frontend, ['react']);
        t.assert.equal(model.hasBackend, true);
    });

    test('interactive registry declined leaves registry unset', async (t: TestContext) => {
        const model = createEmptyModel();
        const cli = baseCli({out: './my-app', language: 'ts', frontend: false, backend: false});
        const prompter = createFakePrompter({
            confirm: {
                'Use custom npm registry?': false,
            },
        });

        await runPromptFlow(model, cli, prompter);

        t.assert.equal(model.registry, undefined);
    });

    test('interactive frontend declined skips styles/react prompts', async (t: TestContext) => {
        const model = createEmptyModel();
        const cli = baseCli({
            out: './my-app',
            registry: 'https://x.example.com',
            language: 'ts',
            backend: false,
        });
        const prompter = createFakePrompter({
            select: {
                'Does your project have a frontend?': false,
            },
        });

        await runPromptFlow(model, cli, prompter);

        t.assert.equal(model.frontend, false);
    });
});
