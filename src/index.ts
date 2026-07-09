#!/usr/bin/env node

import * as p from '@clack/prompts';

import {main} from './cli/main.js';

main().catch((err) => {
    p.cancel(err instanceof Error ? err.message : 'Unexpected error');
    process.exit(1);
});
