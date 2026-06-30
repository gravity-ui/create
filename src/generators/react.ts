import path from 'node:path';

import type {ProjectModel} from '../model/index.js';
import {addDep, addDevDep} from '../utils/pm.js';
import type {FileSystem} from '../utils/types.js';

export async function generateReact(model: ProjectModel, fs: FileSystem): Promise<void> {
    if (!model.hasReact) {
        return;
    }

    addDep(model, 'react', '^18.2.0');
    addDep(model, 'react-dom', '^18.2.0');
    addDep(model, '@gravity-ui/uikit', '^6.0.0');

    if (model.language === 'ts') {
        addDevDep(model, '@types/react', '^18.2.0');
        addDevDep(model, '@types/react-dom', '^18.2.0');
    }

    const ext = model.language === 'ts' ? 'tsx' : 'jsx';
    const appFile = path.join(model.destination, 'src', `App.${ext}`);

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
}
