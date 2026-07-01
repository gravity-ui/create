import path from 'node:path';

import type {ProjectModel} from '../model/index.js';
import {addDep, addDevDep} from '../utils/pm.js';
import type {FileSystem} from '../utils/types.js';

export async function generateReact(model: ProjectModel, fs: FileSystem): Promise<void> {
    if (!model.hasReact) {
        return;
    }

    addDep(model, 'react', '^18.0.0');
    addDep(model, 'react-dom', '^18.0.0');
    addDep(model, '@gravity-ui/uikit', '^7.0.0');

    if (model.language === 'ts') {
        addDevDep(model, '@types/react', '^18.0.0');
        addDevDep(model, '@types/react-dom', '^18.0.0');
    }

    const isTs = model.language === 'ts';
    const jsxExt = isTs ? 'tsx' : 'jsx';
    const fileExt = isTs ? 'ts' : 'js';
    const uiDir = path.join(model.destination, 'src', 'ui');

    const appFile = path.join(uiDir, 'components', 'App', `App.${jsxExt}`);
    await fs.writeFile(
        appFile,
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

    const barrelFile = path.join(uiDir, 'components', `index.${fileExt}`);
    await fs.writeFile(barrelFile, `export {App} from './App/App';\n`);

    const rootElement = isTs
        ? "document.getElementById('root')!"
        : "document.getElementById('root')";
    const entryFile = path.join(uiDir, 'entries', `${model.projectName}-app.${jsxExt}`);
    await fs.writeFile(
        entryFile,
        `import {createRoot} from 'react-dom/client';

import {App} from '../components';

createRoot(${rootElement}).render(<App />);
`,
    );
}
