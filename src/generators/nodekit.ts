import path from 'node:path';

import type {ProjectModel} from '../model/index.js';
import {addDep} from '../utils/pm.js';
import type {FileSystem} from '../utils/types.js';

export async function generateNodekit(model: ProjectModel, fs: FileSystem): Promise<void> {
    if (!model.hasBackend) {
        return;
    }

    addDep(model, '@gravity-ui/nodekit', '^2.0.0');
    addDep(model, '@gravity-ui/expresskit', '^3.0.0');

    const ext = model.language === 'ts' ? 'ts' : 'js';

    const serverFile = path.join(model.destination, 'src', 'server', `index.${ext}`);

    await fs.writeFile(
        serverFile,
        model.hasFrontend ? layoutServer(model) : helloWorldServer(model),
    );
}

function helloWorldServer(model: ProjectModel): string {
    return `import {NodeKit} from '@gravity-ui/nodekit';
import {ExpressKit} from '@gravity-ui/expresskit';

const nodekit = new NodeKit({appName: '${model.projectName}'});

const app = new ExpressKit(nodekit, {
  'GET /': (req, res) => {
    res.send('Hello, world!');
  },
});

app.run();
`;
}

function layoutServer(model: ProjectModel): string {
    addDep(model, '@gravity-ui/app-layout', '^2.0.0');

    return `import {NodeKit} from '@gravity-ui/nodekit';
import {ExpressKit} from '@gravity-ui/expresskit';
import {createRenderFunction, createLayoutPlugin} from '@gravity-ui/app-layout';

const nodekit = new NodeKit({appName: '${model.projectName}'});

const renderLayout = createRenderFunction([
  createLayoutPlugin({
    manifest: 'dist/public/build/assets-manifest.json',
    publicPath: '/build/',
  }),
]);

const app = new ExpressKit(nodekit, {
  'GET *': (req, res) => {
    res.send(renderLayout({title: '${model.projectName}'}));
  },
});

app.run();
`;
}
