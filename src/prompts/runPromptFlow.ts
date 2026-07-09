import path from 'node:path';
import {styleText} from 'node:util';

import {type ParsedCli, YES_DEFAULTS} from '../cli/schema.js';
import type {FrontendFeature, ProjectModel} from '../model/index.js';

import {i18n} from './i18n.js';
import {clackPrompter} from './prompter.js';
import {
    askBackend,
    askDestination,
    askFrontend,
    askLanguage,
    askReact,
    askRegistry,
    askStyles,
} from './questions.js';
import type {Prompter, StepConfig} from './types.js';

function yesNo(value: boolean) {
    return value ? i18n.label_yes : i18n.label_no;
}

function skippedStep(prompter: Prompter, label: string, value: string) {
    prompter.step(`${label}\n${styleText('dim', value)}`);
}

async function resolveStep<T>(
    prompter: Prompter,
    cliYes: boolean,
    config: StepConfig<T>,
): Promise<void> {
    let value: T | undefined = config.cli;

    if (value === undefined && cliYes) {
        value = config.yesDefault;
    }

    if (value === undefined) {
        await config.ask();
    } else {
        skippedStep(prompter, config.label, config.format(value));

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
export async function runPromptFlow(
    model: ProjectModel,
    cli: ParsedCli,
    prompter: Prompter = clackPrompter,
): Promise<void> {
    // Destination
    if (cli.out !== undefined) {
        skippedStep(prompter, i18n.label_destination, cli.out);

        model.destination = path.resolve(process.cwd(), cli.out);
        model.projectName = path.basename(model.destination);
    } else if (cli.yes) {
        throw new Error('Destination is required when --yes is used.');
    } else {
        await askDestination(prompter, model, cli['dry-run']);
    }

    // Registry
    if (cli.registry !== undefined) {
        skippedStep(prompter, i18n.label_registry, cli.registry);

        model.registry = cli.registry;
    } else if (!cli.yes) {
        await askRegistry(prompter, model);
    }

    // Language
    await resolveStep(prompter, cli.yes, {
        cli: cli.language,
        yesDefault: YES_DEFAULTS.language,
        label: i18n.label_language,
        format: languageFormat,
        set: setModelValue(model, 'language'),
        ask: () => askLanguage(prompter, model),
    });

    // Frontend
    await resolveStep(prompter, cli.yes, {
        cli: cli.frontend,
        yesDefault: YES_DEFAULTS.frontend,
        label: i18n['label_has-frontend'],
        format: yesNo,
        set: setFrontendEnabled(model),
        ask: async () => setFrontendEnabled(model)(await askFrontend(prompter)),
    });

    if (model.frontend) {
        const frontend: FrontendFeature[] = model.frontend;

        // Styles
        await resolveStep(prompter, cli.yes, {
            cli: cli.styles,
            yesDefault: YES_DEFAULTS.styles,
            label: i18n['label_has-styles'],
            format: yesNo,
            set: addFrontendFeature(frontend, 'styles'),
            ask: async () => addFrontendFeature(frontend, 'styles')(await askStyles(prompter)),
        });

        // React
        await resolveStep(prompter, cli.yes, {
            cli: cli.react,
            yesDefault: YES_DEFAULTS.react,
            label: i18n['label_has-react'],
            format: yesNo,
            set: addFrontendFeature(frontend, 'react'),
            ask: async () => addFrontendFeature(frontend, 'react')(await askReact(prompter)),
        });
    }

    // Backend
    await resolveStep(prompter, cli.yes, {
        cli: cli.backend,
        yesDefault: YES_DEFAULTS.backend,
        label: i18n['label_has-backend'],
        format: yesNo,
        set: setModelValue(model, 'hasBackend'),
        ask: () => askBackend(prompter, model),
    });
}
