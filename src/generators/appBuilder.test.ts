import test, {type TestContext} from 'node:test';

import {setupGeneratorTest} from './__fixtures__/setupGeneratorTest.js';
import {generateAppBuilder} from './appBuilder.js';

test.describe('app-builder generator', () => {
    test('react + TS project writes app-builder ui layout', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateAppBuilder, {
            destination: '/project',
            projectName: 'my-app',
            language: 'ts',
            frontend: ['react'],
        });

        const app = file('src/ui/components/App/App.tsx');
        t.assert.ok(app);
        t.assert.equal(
            app.content,
            `import {ThemeProvider} from '@gravity-ui/uikit';

export function App() {
  return (
    <ThemeProvider theme="light">
      <h1>Hello, Gravity UI!</h1>
    </ThemeProvider>
  );
}
`,
        );

        const barrel = file('src/ui/components/index.ts');
        t.assert.ok(barrel);
        t.assert.equal(barrel.content, `export {App} from './App/App';\n`);

        const entry = file('src/ui/entries/my-app-app.tsx');
        t.assert.ok(entry);
        t.assert.equal(
            entry.content,
            `import {createRoot} from 'react-dom/client';

import {App} from '../components';

import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

createRoot(document.getElementById('root')!).render(<App />);
`,
        );

        t.assert.equal(file('src/App.tsx'), null);
    });

    test('react + JS project uses jsx/js extensions', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateAppBuilder, {
            destination: '/project',
            projectName: 'my-app',
            language: 'js',
            frontend: ['react'],
        });

        t.assert.ok(file('src/ui/components/App/App.jsx'));
        t.assert.ok(file('src/ui/components/index.js'));

        const entry = file('src/ui/entries/my-app-app.jsx');
        t.assert.ok(entry);
        t.assert.equal(
            entry.content,
            `import {createRoot} from 'react-dom/client';

import {App} from '../components';

import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

createRoot(document.getElementById('root')).render(<App />);
`,
        );
    });

    test('frontend without react writes no react files', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateAppBuilder, {
            destination: '/project',
            projectName: 'my-app',
            language: 'ts',
            frontend: [],
        });

        t.assert.equal(file('src/ui/components/App/App.tsx'), null);
        t.assert.equal(file('src/ui/components/index.ts'), null);
        t.assert.equal(file('src/ui/entries/my-app-app.tsx'), null);

        const entry = file('src/ui/entries/my-app-app.ts');
        t.assert.ok(entry);
        t.assert.equal(
            entry.content,
            `const header = document.createElement('h1');

header.innerText = 'Hello, world!';

document.querySelector<HTMLDivElement>('#root')?.append(header);
`,
        );
    });

    test('frontend without react, JS project writes plain js entry', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateAppBuilder, {
            destination: '/project',
            projectName: 'my-app',
            language: 'js',
            frontend: [],
        });

        t.assert.equal(file('src/ui/components/App/App.jsx'), null);
        t.assert.equal(file('src/ui/components/index.js'), null);
        t.assert.equal(file('src/ui/entries/my-app-app.jsx'), null);

        const entry = file('src/ui/entries/my-app-app.js');
        t.assert.ok(entry);
        t.assert.equal(
            entry.content,
            `const header = document.createElement('h1');

header.innerText = 'Hello, world!';

document.querySelector('#root')?.append(header);
`,
        );
    });

    test('no frontend and no backend writes no app-builder files', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateAppBuilder, {
            destination: '/project',
            projectName: 'my-app',
            language: 'ts',
        });

        t.assert.equal(file('src/ui/components/App/App.tsx'), null);
        t.assert.equal(file('src/ui/components/index.ts'), null);
        t.assert.equal(file('src/ui/entries/my-app-app.ts'), null);
        t.assert.equal(file('src/ui/entries/my-app-app.tsx'), null);
    });

    test('backend-only project uses server target and writes no ui entry', async (t: TestContext) => {
        const {file, model} = await setupGeneratorTest(generateAppBuilder, {
            destination: '/project',
            projectName: 'my-app',
            language: 'ts',
            hasBackend: true,
        });

        t.assert.equal(model.scripts.dev, 'app-builder dev --target server');
        t.assert.equal(
            model.scripts.build,
            'NODE_ENV=production app-builder build --target server',
        );
        t.assert.equal(model.scripts.start, 'node dist/server/index.js');
        t.assert.equal(model.packages.devDependencies['@gravity-ui/app-builder'], '^0.49.0');

        t.assert.ok(file('app-builder.config.ts'));
        t.assert.equal(file('src/ui/entries/my-app-app.ts'), null);
        t.assert.equal(file('src/ui/components/App/App.tsx'), null);
    });

    test('frontend + backend project uses no target flag', async (t: TestContext) => {
        const {file, model} = await setupGeneratorTest(generateAppBuilder, {
            destination: '/project',
            projectName: 'my-app',
            language: 'ts',
            frontend: [],
            hasBackend: true,
        });

        t.assert.equal(model.scripts.dev, 'app-builder dev');
        t.assert.equal(model.scripts.build, 'NODE_ENV=production app-builder build');
        t.assert.equal(model.scripts.start, 'node dist/server/index.js');

        t.assert.ok(file('src/ui/entries/my-app-app.ts'));
    });

    test('app-builder.config content reflects hasReact/hasFrontend/hasBackend', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateAppBuilder, {
            destination: '/project',
            projectName: 'my-app',
            language: 'ts',
            frontend: ['react'],
            hasBackend: true,
        });

        const config = file('app-builder.config.ts');
        t.assert.ok(config);
        t.assert.match(config.content, /newJsxTransform: true/);
        t.assert.match(config.content, /server: {/);

        const jsConfig = await setupGeneratorTest(generateAppBuilder, {
            destination: '/project',
            projectName: 'my-app',
            language: 'js',
            frontend: [],
        });
        t.assert.ok(jsConfig.file('app-builder.config.js'));
        t.assert.equal(jsConfig.file('app-builder.config.ts'), null);
    });
});
