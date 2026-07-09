import {chmod} from 'node:fs/promises';

await chmod('lib/index.js', 0o755);
