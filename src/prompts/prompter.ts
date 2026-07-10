import * as p from '@clack/prompts';

import {ExitSignal} from '../utils/exit.js';

import {i18n} from './i18n.js';
import type {Prompter} from './types.js';

function ensure<T>(value: T | symbol): T {
    if (p.isCancel(value)) {
        p.cancel(i18n.label_cancel);
        throw new ExitSignal(0);
    }
    return value as T;
}

export const clackPrompter: Prompter = {
    async text(opts) {
        return ensure(await p.text(opts));
    },
    async select(opts) {
        return ensure(await p.select(opts));
    },
    async confirm(opts) {
        return ensure(await p.confirm(opts));
    },
    step(message) {
        p.log.step(message);
    },
};
