import {readFile, readdir, writeFile} from 'node:fs/promises';
import path from 'node:path';

import Handlebars from 'handlebars';

const templatesRoot = path.join(import.meta.dirname, '..', 'src', 'generators', 'templates');

async function collectHbsFiles(dir: string): Promise<string[]> {
    const entries = await readdir(dir, {withFileTypes: true});
    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...(await collectHbsFiles(fullPath)));
        } else if (entry.name.endsWith('.hbs')) {
            files.push(fullPath);
        }
    }

    return files;
}

async function precompileFile(filePath: string): Promise<void> {
    const source = await readFile(filePath, 'utf8');
    const precompiled = Handlebars.precompile(source);
    const output = `// @ts-nocheck\nimport Handlebars from 'handlebars';\n\nexport default Handlebars.template(${precompiled});\n`;
    await writeFile(`${filePath}.ts`, output);
}

const hbsFiles = await collectHbsFiles(templatesRoot);
await Promise.all(hbsFiles.map(precompileFile));

console.info(`Precompiled ${hbsFiles.length} template(s) into ${templatesRoot}`);
