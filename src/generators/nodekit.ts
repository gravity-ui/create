import path from 'node:path';

import type {ProjectModel} from '../model/index.js';
import {addDep, addScript} from '../utils/pm.js';
import type {FileSystem} from '../utils/types.js';

export async function generateNodekit(model: ProjectModel, fs: FileSystem): Promise<void> {
    if (!model.hasBackend) {
        return;
    }

    addDep(model, '@gravity-ui/nodekit', '^1.5.0');
    addDep(model, '@gravity-ui/expresskit', '^1.2.0');

    const ext = model.language === 'ts' ? 'ts' : 'js';
    addScript(
        model,
        'start',
        model.language === 'ts' ? 'tsc && node dist/server.js' : 'node src/server.js',
    );
    addScript(model, 'dev', model.language === 'ts' ? 'tsc --watch' : 'node --watch src/server.js');

    const serverFile = path.join(model.destination, 'src', `server.${ext}`);

    await fs.writeFile(
        serverFile,
        `import {NodeKit} from '@gravity-ui/nodekit';
import {ExpressKit} from '@gravity-ui/expresskit';

const nodekit = new NodeKit({appName: '${model.projectName}'});

const app = new ExpressKit(nodekit, {
  'GET /': (req, res) => {
    res.send('Hello, world!');
  },
});

app.run();
`,
    );
}
