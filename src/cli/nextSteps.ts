import path from 'node:path';

import type {ProjectModel} from '../model/types.js';

export function buildNextSteps(
    model: Pick<ProjectModel, 'destination' | 'hasBackend'>,
    cwd: string,
): string[] {
    return [
        `cd ${path.relative(cwd, model.destination)}`,
        'npm install',
        model.hasBackend ? 'npm run dev' : null,
    ].filter((step): step is string => step !== null);
}
