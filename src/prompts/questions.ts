import path from 'node:path';

import * as p from '@clack/prompts';

import type {ProjectModel} from '../model/index.js';
import {DEFAULT_NPM_REGISTRY} from '../utils/constants.js';
import {validateDestination} from '../utils/destination.js';

import {i18n} from './i18n.js';

function ensure<T>(value: T | symbol): T {
    if (p.isCancel(value)) {
        p.cancel(i18n.label_cancel);
        process.exit(0);
    }
    return value as T;
}

export async function askDestination(model: ProjectModel): Promise<void> {
    const dest = ensure(
        await p.text({
            message: i18n.label_destination,
            placeholder: './my-gravity-app',
            defaultValue: './my-gravity-app',
            validate(value) {
                return validateDestination(process.cwd(), value);
            },
        }),
    );

    model.destination = path.resolve(process.cwd(), dest);
    model.projectName = path.basename(model.destination);
}

export async function askRegistry(model: ProjectModel): Promise<void> {
    const useRegistry = ensure(
        await p.confirm({
            message: i18n['label_registry-question'],
            initialValue: false,
        }),
    );

    if (!useRegistry) {
        return;
    }

    const registry = ensure(
        await p.text({
            message: i18n.label_registry,
            placeholder: DEFAULT_NPM_REGISTRY,
            defaultValue: DEFAULT_NPM_REGISTRY,
        }),
    );

    model.registry = registry;
}

export async function askLanguage(model: ProjectModel): Promise<void> {
    const language = ensure(
        await p.select({
            message: i18n.label_language,
            options: [
                {value: 'ts', label: i18n['label_language-ts'], hint: 'recommended'},
                {value: 'js', label: i18n['label_language-js']},
            ],
            initialValue: 'ts',
        }),
    );

    model.language = language as 'ts' | 'js';
}

export async function askFrontend(): Promise<boolean> {
    const hasFrontend = ensure(
        await p.select({
            message: i18n['label_has-frontend'],
            options: [
                {value: true, label: i18n.label_yes},
                {value: false, label: i18n.label_no},
            ],
            initialValue: true,
        }),
    );

    return hasFrontend as boolean;
}

export async function askStyles(): Promise<boolean> {
    const hasStyles = ensure(
        await p.select({
            message: i18n['label_has-styles'],
            options: [
                {value: true, label: i18n.label_yes, hint: 'adds stylelint'},
                {value: false, label: i18n.label_no},
            ],
            initialValue: true,
        }),
    );

    return hasStyles as boolean;
}

export async function askReact(): Promise<boolean> {
    const hasReact = ensure(
        await p.select({
            message: i18n['label_has-react'],
            options: [
                {value: true, label: i18n.label_yes, hint: 'sets up new JSX transform'},
                {value: false, label: i18n.label_no},
            ],
            initialValue: true,
        }),
    );

    return hasReact as boolean;
}

export async function askBackend(model: ProjectModel): Promise<void> {
    const hasBackend = ensure(
        await p.select({
            message: i18n['label_has-backend'],
            options: [
                {value: true, label: i18n.label_yes, hint: 'sets up nodekit + expresskit'},
                {value: false, label: i18n.label_no},
            ],
            initialValue: false,
        }),
    );

    model.hasBackend = hasBackend as boolean;
}
