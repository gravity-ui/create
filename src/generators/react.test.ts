import test, {type TestContext} from 'node:test';

import {setupGeneratorTest} from './__fixtures__/setupGeneratorTest.js';
import {generateReact} from './react.js';

test.describe('react generator', () => {
    test('react + TS project writes app-builder ui layout', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateReact, {
            destination: '/project',
            projectName: 'my-app',
            language: 'ts',
            hasFrontend: true,
            hasReact: true,
        });

        const app = file('/project/src/ui/components/App/App.tsx');
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

        const barrel = file('/project/src/ui/components/index.ts');
        t.assert.ok(barrel);
        t.assert.equal(barrel.content, `export {App} from './App/App';\n`);

        const entry = file('/project/src/ui/entries/my-app-app.tsx');
        t.assert.ok(entry);
        t.assert.equal(
            entry.content,
            `import {createRoot} from 'react-dom/client';

import {App} from '../components';

createRoot(document.getElementById('root')!).render(<App />);
`,
        );

        t.assert.equal(file('/project/src/App.tsx'), null);
    });

    test('react + JS project uses jsx/js extensions', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateReact, {
            destination: '/project',
            projectName: 'my-app',
            language: 'js',
            hasFrontend: true,
            hasReact: true,
        });

        t.assert.ok(file('/project/src/ui/components/App/App.jsx'));
        t.assert.ok(file('/project/src/ui/components/index.js'));

        const entry = file('/project/src/ui/entries/my-app-app.jsx');
        t.assert.ok(entry);
        t.assert.equal(
            entry.content,
            `import {createRoot} from 'react-dom/client';

import {App} from '../components';

createRoot(document.getElementById('root')).render(<App />);
`,
        );
    });

    test('frontend without react writes no react files', async (t: TestContext) => {
        const {file} = await setupGeneratorTest(generateReact, {
            destination: '/project',
            projectName: 'my-app',
            language: 'ts',
            hasFrontend: true,
        });

        t.assert.equal(file('/project/src/ui/components/App/App.tsx'), null);
        t.assert.equal(file('/project/src/ui/components/index.ts'), null);
        t.assert.equal(file('/project/src/ui/entries/my-app-app.tsx'), null);
    });
});
