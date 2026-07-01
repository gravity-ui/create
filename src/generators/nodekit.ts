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

    await fs.writeFile(serverFile, model.hasFrontend ? layoutServer(model) : helloWorldServer());
}

function helloWorldServer(): string {
    return `import {NodeKit} from '@gravity-ui/nodekit';
import {ExpressKit} from '@gravity-ui/expresskit';

const nodekit = new NodeKit({});

const app = new ExpressKit(nodekit, {
  'GET /': (_, res) => {
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

const nodekit = new NodeKit({});

const renderLayout = createRenderFunction([
  createLayoutPlugin({
    manifest: 'dist/public/build/assets-manifest.json',
    publicPath: '/build/',
  }),
]);

const app = new ExpressKit(nodekit, {
  'GET *': (_, res) => {
    res.send(renderLayout({title: '${model.projectName}'}));
  },
});

app.run();
`;
}
