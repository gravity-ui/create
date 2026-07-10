import {styleText} from 'util';

import * as p from '@clack/prompts';

import {runGenerators} from '../generators/index.js';
import {createEmptyModel} from '../model/index.js';
import {runPromptFlow} from '../prompts/index.js';
import {ExitSignal} from '../utils/exit.js';

import {parseCli} from './args.js';
import {renderDryRunSummary} from './dryRun.js';
import {printHelp} from './help.js';
import {buildNextSteps} from './nextSteps.js';
import type {ParsedCli} from './schema.js';
import {readVersion} from './version.js';

export async function main(): Promise<void> {
    let cli: ParsedCli;
    try {
        cli = parseCli(process.argv.slice(2));
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        process.stderr.write(styleText('red', `Error:\n${msg}`) + '\n');
        process.stderr.write('Run with --help for usage.\n');
        throw new ExitSignal(1);
    }

    if (cli.help) {
        printHelp();
        return;
    }

    if (cli.version) {
        const version = readVersion();
        process.stdout.write(version + '\n');
        return;
    }

    p.intro(styleText(['bgCyan', 'black'], '🪐 @gravity-ui/create '));

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
        const nextSteps = buildNextSteps(model, process.cwd()).join('\n');
        p.note(nextSteps, 'Next steps');
        p.outro(styleText('green', `✓ Project created at ${model.destination}`));
    }
}
