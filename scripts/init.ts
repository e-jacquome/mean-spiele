import * as fs from 'fs-extra';
import * as path from 'path';

import { dir } from './shared';

const { src, config, dist } = dir;
const serverSrc = path.join(src, 'server');
const serverDist = path.join(dist, 'server');

// JSON-Dateien kopieren
const jsonSrc = path.join(src, 'server');
const jsonDist = path.join(dist, 'server');
fs.copy(jsonSrc, jsonDist, err => {
    if (err !== undefined && err !== null) {
        console.error(err);
    }

})
