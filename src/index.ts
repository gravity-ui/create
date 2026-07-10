#!/usr/bin/env node

import * as p from '@clack/prompts';

import {main} from './cli/main.js';
import {ExitSignal} from './utils/exit.js';

main().catch((err) => {
    if (err instanceof ExitSignal) {
        process.exitCode = err.code;
        return;
    }
    p.cancel(err instanceof Error ? err.message : 'Unexpected error');
    process.exitCode = 1;
});
