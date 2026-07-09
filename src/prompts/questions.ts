import path from 'node:path';

import type {ProjectModel} from '../model/index.js';
import {DEFAULT_NPM_REGISTRY} from '../utils/constants.js';
import {validateDestination} from '../utils/destination.js';

import {i18n} from './i18n.js';
import type {Prompter} from './types.js';

export async function askDestination(
    prompter: Prompter,
    model: ProjectModel,
    dryRun: boolean,
): Promise<void> {
    const dest = await prompter.text({
        message: i18n.label_destination,
        placeholder: './my-gravity-app',
        defaultValue: './my-gravity-app',
        validate(value) {
            return validateDestination(process.cwd(), value, {allowExisting: dryRun});
        },
    });

    model.destination = path.resolve(process.cwd(), dest);
    model.projectName = path.basename(model.destination);
}

export async function askRegistry(prompter: Prompter, model: ProjectModel): Promise<void> {
    const useRegistry = await prompter.confirm({
        message: i18n['label_registry-question'],
        initialValue: false,
    });

    if (!useRegistry) {
        return;
    }

    const registry = await prompter.text({
        message: i18n.label_registry,
        placeholder: DEFAULT_NPM_REGISTRY,
        defaultValue: DEFAULT_NPM_REGISTRY,
    });

    model.registry = registry;
}

export async function askLanguage(prompter: Prompter, model: ProjectModel): Promise<void> {
    const language = await prompter.select<'ts' | 'js'>({
        message: i18n.label_language,
        options: [
            {value: 'ts', label: i18n['label_language-ts'], hint: 'recommended'},
            {value: 'js', label: i18n['label_language-js']},
        ],
        initialValue: 'ts',
    });

    model.language = language;
}

export async function askFrontend(prompter: Prompter): Promise<boolean> {
    return prompter.select<boolean>({
        message: i18n['label_has-frontend'],
        options: [
            {value: true, label: i18n.label_yes},
            {value: false, label: i18n.label_no},
        ],
        initialValue: true,
    });
}

export async function askStyles(prompter: Prompter): Promise<boolean> {
    return prompter.select<boolean>({
        message: i18n['label_has-styles'],
        options: [
            {value: true, label: i18n.label_yes, hint: 'adds stylelint'},
            {value: false, label: i18n.label_no},
        ],
        initialValue: true,
    });
}

export async function askReact(prompter: Prompter): Promise<boolean> {
    return prompter.select<boolean>({
        message: i18n['label_has-react'],
        options: [
            {value: true, label: i18n.label_yes, hint: 'sets up new JSX transform'},
            {value: false, label: i18n.label_no},
        ],
        initialValue: true,
    });
}

export async function askBackend(prompter: Prompter, model: ProjectModel): Promise<void> {
    const hasBackend = await prompter.select<boolean>({
        message: i18n['label_has-backend'],
        options: [
            {value: true, label: i18n.label_yes, hint: 'sets up nodekit + expresskit'},
            {value: false, label: i18n.label_no},
        ],
        initialValue: false,
    });

    model.hasBackend = hasBackend;
}
