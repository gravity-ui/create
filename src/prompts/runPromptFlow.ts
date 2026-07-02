import {styleText} from 'node:util';

import {log} from '@clack/prompts';

import {type ParsedCli, YES_DEFAULTS} from '../cli/schema.js';
import type {ProjectModel} from '../model/index.js';

import {i18n} from './i18n.js';
import {
    askBackend,
    askDestination,
    askFrontend,
    askLanguage,
    askReact,
    askRegistry,
    askStyles,
} from './questions.js';

function yesNo(value: boolean) {
    return value ? i18n.label_yes : i18n.label_no;
}

function skippedStep(label: string, value: string) {
    log.step(`${label}\n${styleText('dim', value)}`);
}

/**
 * Runs the questionnaire, skipping any prompt whose answer was
 * pre-supplied via CLI flags. With --yes, missing answers fall back
 * to sensible defaults rather than prompting.
 */
export async function runPromptFlow(model: ProjectModel, cli: ParsedCli): Promise<void> {
    // Destination
    if (cli.out !== undefined) {
        skippedStep(i18n.label_destination, cli.out);

        model.destination = cli.out;
        // projectName derived inside askDestination; do the same here
        const path = await import('node:path');
        model.destination = path.resolve(process.cwd(), cli.out);
        model.projectName = path.basename(model.destination);
    } else if (cli.yes) {
        throw new Error('Destination is required when --yes is used.');
    } else {
        await askDestination(model);
    }

    // Registry
    if (cli.registry !== undefined) {
        skippedStep(i18n.label_registry, cli.registry);

        model.registry = cli.registry;
    } else if (!cli.yes) {
        await askRegistry(model);
    }

    // Language
    if (cli.language !== undefined) {
        skippedStep(i18n.label_language, cli.language);

        model.language = cli.language;
    } else if (cli.yes) {
        const value = YES_DEFAULTS.language;
        skippedStep(i18n.label_language, value);

        model.language = value;
    } else {
        await askLanguage(model);
    }

    // Frontend
    if (cli.frontend !== undefined) {
        skippedStep(i18n['label_has-frontend'], yesNo(cli.frontend));

        model.hasFrontend = cli.frontend;
    } else if (cli.yes) {
        const value = YES_DEFAULTS.frontend;
        skippedStep(i18n['label_has-frontend'], yesNo(value));

        model.hasFrontend = value;
    } else {
        await askFrontend(model);
    }

    if (model.hasFrontend) {
        // Styles
        if (cli.styles !== undefined) {
            skippedStep(i18n['label_has-styles'], yesNo(cli.styles));

            model.hasStyles = cli.styles;
        } else if (cli.yes) {
            const value = YES_DEFAULTS.styles;
            skippedStep(i18n['label_has-styles'], yesNo(value));

            model.hasStyles = value;
        } else {
            await askStyles(model);
        }

        // React
        if (cli.react !== undefined) {
            skippedStep(i18n['label_has-react'], yesNo(cli.react));

            model.hasReact = cli.react;
        } else if (cli.yes) {
            const value = YES_DEFAULTS.react;
            skippedStep(i18n['label_has-react'], yesNo(value));

            model.hasReact = value;
        } else {
            await askReact(model);
        }
    }

    // Backend
    if (cli.backend !== undefined) {
        skippedStep(i18n['label_has-backend'], yesNo(cli.backend));

        model.hasBackend = cli.backend;
    } else if (cli.yes) {
        const value = YES_DEFAULTS.backend;
        skippedStep(i18n['label_has-backend'], yesNo(value));

        model.hasBackend = value;
    } else {
        await askBackend(model);
    }
}
