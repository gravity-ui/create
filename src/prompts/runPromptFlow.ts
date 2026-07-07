import {styleText} from 'node:util';

import {log} from '@clack/prompts';

import {type ParsedCli, YES_DEFAULTS} from '../cli/schema.js';
import type {FrontendFeature, ProjectModel} from '../model/index.js';

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
import type {StepConfig} from './types.js';

function yesNo(value: boolean) {
    return value ? i18n.label_yes : i18n.label_no;
}

function skippedStep(label: string, value: string) {
    log.step(`${label}\n${styleText('dim', value)}`);
}

async function resolveStep<T>(cliYes: boolean, config: StepConfig<T>): Promise<void> {
    let value: T | undefined = config.cli;

    if (value === undefined && cliYes) {
        value = config.yesDefault;
    }

    if (value === undefined) {
        await config.ask();
    } else {
        skippedStep(config.label, config.format(value));

        config.set(value);
    }
}

function languageFormat(value: 'js' | 'ts'): string {
    return i18n[`label_language-${value}`];
}

function setModelValue<T extends keyof ProjectModel>(model: ProjectModel, key: T) {
    return (value: ProjectModel[T]) => {
        model[key] = value;
    };
}

function setFrontendEnabled(model: ProjectModel) {
    return (enabled: boolean) => {
        model.frontend = enabled ? [] : false;
    };
}

function addFrontendFeature(frontend: FrontendFeature[], feature: FrontendFeature) {
    return (enabled: boolean) => {
        if (enabled) {
            frontend.push(feature);
        }
    };
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
    await resolveStep(cli.yes, {
        cli: cli.language,
        yesDefault: YES_DEFAULTS.language,
        label: i18n.label_language,
        format: languageFormat,
        set: setModelValue(model, 'language'),
        ask: () => askLanguage(model),
    });

    // Frontend
    await resolveStep(cli.yes, {
        cli: cli.frontend,
        yesDefault: YES_DEFAULTS.frontend,
        label: i18n['label_has-frontend'],
        format: yesNo,
        set: setFrontendEnabled(model),
        ask: async () => setFrontendEnabled(model)(await askFrontend()),
    });

    if (model.frontend) {
        const frontend: FrontendFeature[] = model.frontend;

        // Styles
        await resolveStep(cli.yes, {
            cli: cli.styles,
            yesDefault: YES_DEFAULTS.styles,
            label: i18n['label_has-styles'],
            format: yesNo,
            set: addFrontendFeature(frontend, 'styles'),
            ask: async () => addFrontendFeature(frontend, 'styles')(await askStyles()),
        });

        // React
        await resolveStep(cli.yes, {
            cli: cli.react,
            yesDefault: YES_DEFAULTS.react,
            label: i18n['label_has-react'],
            format: yesNo,
            set: addFrontendFeature(frontend, 'react'),
            ask: async () => addFrontendFeature(frontend, 'react')(await askReact()),
        });
    }

    // Backend
    await resolveStep(cli.yes, {
        cli: cli.backend,
        yesDefault: YES_DEFAULTS.backend,
        label: i18n['label_has-backend'],
        format: yesNo,
        set: setModelValue(model, 'hasBackend'),
        ask: () => askBackend(model),
    });
}
