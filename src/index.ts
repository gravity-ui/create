#!/usr/bin/env node

import {styleText} from 'node:util';

import * as p from '@clack/prompts';

import {parseCli} from './cli/args.js';
import {renderDryRunSummary} from './cli/dryRun.js';
import {printHelp} from './cli/help.js';
import type {ParsedCli} from './cli/schema.js';
import {readVersion} from './cli/version.js';
import {runGenerators} from './generators/index.js';
import {createEmptyModel} from './model/index.js';
import {runPromptFlow} from './prompts/index.js';

async function main(): Promise<void> {
    let cli: ParsedCli;
    try {
        cli = parseCli(process.argv.slice(2));
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        process.stderr.write(styleText('red', `Error:\n${msg}`) + '\n');
        process.stderr.write('Run with --help for usage.\n');
        process.exit(1);
    }

    if (cli.help) {
        printHelp();
        process.exit(0);
    }

    if (cli.version) {
        const version = readVersion();
        process.stdout.write(version + '\n');
        process.exit(0);
    }

    p.intro(styleText(['bgCyan', 'black'], ' @gravity-ui/create '));

    const model = createEmptyModel();
    await runPromptFlow(model, cli);

    const isDryRun = cli['dry-run'];
    const s = p.spinner();
    s.start(isDryRun ? 'Computing project files' : 'Generating project files');
    let result;
    try {
        result = await runGenerators(model, {dryRun: isDryRun});
        s.stop(isDryRun ? 'Preview ready' : 'Project files generated');
    } catch (err) {
        s.stop('Generation failed');
        throw err;
    }

    if (isDryRun) {
        renderDryRunSummary(model.destination, result.files);
        p.outro(styleText('green', 'Dry run complete — no files were written'));
    } else {
        const nextSteps = [
            `cd ${model.projectName}`,
            'npm install',
            model.hasBackend ? 'npm run dev' : null,
        ]
            .filter(Boolean)
            .join('\n');
        p.note(nextSteps, 'Next steps');
        p.outro(styleText('green', `✓ Project created at ${model.destination}`));
    }
}

main().catch((err) => {
    p.cancel(err instanceof Error ? err.message : 'Unexpected error');
    process.exit(1);
});
