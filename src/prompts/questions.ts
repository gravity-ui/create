import path from 'node:path';

import * as p from '@clack/prompts';

import type {ProjectModel} from '../model/index.js';

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
                if (!value || value.trim().length === 0) {
                    return 'Folder is required';
                }
                return undefined;
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
            placeholder: 'https://registry.npmjs.org/',
            defaultValue: 'https://registry.npmjs.org/',
        }),
    );

    model.registry = registry;
}

export async function askLanguage(model: ProjectModel): Promise<void> {
    const language = ensure(
        await p.select({
            message: i18n.label_language,
            options: [
                {value: 'ts', label: 'TypeScript', hint: 'recommended'},
                {value: 'js', label: 'JavaScript'},
            ],
            initialValue: 'ts',
        }),
    );

    model.language = language as 'ts' | 'js';
}

export async function askFrontend(model: ProjectModel): Promise<void> {
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

    model.hasFrontend = hasFrontend as boolean;
}

export async function askStyles(model: ProjectModel): Promise<void> {
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

    model.hasStyles = hasStyles as boolean;
}

export async function askReact(model: ProjectModel): Promise<void> {
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

    model.hasReact = hasReact as boolean;
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
