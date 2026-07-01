import {createEmptyModel} from '../../model/createEmptyModel.js';
import type {ProjectModel} from '../../model/types.js';
import {createMemFs} from '../../utils/memfs.js';
import type {FileSystem} from '../../utils/types.js';

import {filesOf} from './testUtils.js';

export async function setupGeneratorTest(
    generator: (model: ProjectModel, fs: FileSystem) => Promise<void>,
    model: Partial<ProjectModel>,
) {
    const finalModel: ProjectModel = Object.assign(createEmptyModel(), model);
    const fs = createMemFs();

    await generator(finalModel, fs);

    const {file} = filesOf(fs);

    return {
        file,
    };
}
