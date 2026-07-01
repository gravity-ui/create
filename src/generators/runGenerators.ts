import type {ProjectModel} from '../model/index.js';
import {flushFiles} from '../utils/fs.js';
import {createMemFs} from '../utils/memfs.js';

import {generateBase} from './base.js';
import {generateBundling} from './bundle.js';
import {generateLinters} from './linters.js';
import {generateNodekit} from './nodekit.js';
import {generateReact} from './react.js';
import {generateStylelint} from './stylelint.js';
import type {GenerateOptions, GenerateResult} from './types.js';
import {generateTypeScript} from './typescript.js';

export async function runGenerators(
    model: ProjectModel,
    options: GenerateOptions = {},
): Promise<GenerateResult> {
    const fs = createMemFs();

    // Order matters: feature generators register deps/scripts first,
    // base generator writes the final package.json last.
    await generateTypeScript(model, fs);
    await generateStylelint(model, fs);
    await generateReact(model, fs);
    await generateNodekit(model, fs);
    await generateLinters(model, fs);
    generateBundling(model);
    await generateBase(model, fs);

    if (!options.dryRun) {
        await flushFiles(fs.files);
    }

    return {
        files: fs.files,
    };
}
