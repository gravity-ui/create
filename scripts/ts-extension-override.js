/** @type {import('node:module').ResolveHook} */
export const resolve = async (specifier, context, nextResolve) => {
    if (specifier.endsWith('.js')) {
        const tsSpecifier = specifier.replace(/\.js$/, '.ts');
        try {
            return await nextResolve(tsSpecifier, context);
        } catch {
            // Fall back to original if .ts doesn't exist
            return await nextResolve(specifier, context);
        }
    }
    return nextResolve(specifier, context);
};

/** @type {import('node:module').LoadHook} */
export const load = async (url, context, nextLoad) => {
    if (url.endsWith('.md')) {
        const {readFile} = await import('node:fs/promises');
        const {fileURLToPath} = await import('node:url');
        const source = await readFile(fileURLToPath(url), 'utf8');
        return {
            format: 'module',
            source: `export default ${JSON.stringify(source)};`,
            shortCircuit: true,
        };
    }
    return nextLoad(url, context);
};
