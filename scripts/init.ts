// @ts-ignore
import * as copydir from 'copy-dir';
import * as fs from 'fs';
import { join } from 'path';

import { dir } from './shared';

const { mkdirSync } = fs;
const { copyFileSync } = fs;

const { src, config, dist } = dir;
const serverSrc = join(src, 'server');
const serverDist = join(dist, 'server');

// JSON-Dateien kopieren
const jsonSrc = join(serverSrc, 'auth', 'service', 'json');
const jsonDist = join(serverDist, 'auth', 'service', 'json');
mkdirSync(jsonDist, { recursive: true });
copydir.sync(jsonSrc, jsonDist);

// PEM-Dateien fuer JWT kopieren
const jwtPemSrc = join(serverSrc, 'auth', 'service', 'jwt');
const jwtPemDist = join(serverDist, 'auth', 'service', 'jwt');
copydir.sync(jwtPemSrc, jwtPemDist);

// PEM- und Zertifikatdateien fuer HTTPS kopieren
const httpsSrc = join(config, 'https');
const httpsDist = join(serverDist, 'shared', 'config');
mkdirSync(httpsDist, { recursive: true });
copydir.sync(httpsSrc, httpsDist);

// Zertifikatdatei fuer MongoDB kopieren
const mongoSrc = join(config, 'db', 'mongodb.cer');
const mongoDist = join(serverDist, 'shared', 'config');
mkdirSync(mongoDist, { recursive: true });
copyFileSync(mongoSrc, join(mongoDist, 'mongodb.cer'));

// Konfig-Dateien fuer Nodemon kopieren
const nodemonSrc = join(config, 'nodemon');
copydir.sync(nodemonSrc, serverDist);

// -----------------------------------------------------------------------------
// E J S
// -----------------------------------------------------------------------------

// Views mit Partials
const viewsSrc = join(serverSrc, 'views');
const viewsDist = join(serverDist, 'views');
mkdirSync(viewsDist, { recursive: true });
copydir.sync(viewsSrc, viewsDist);

// Fontawesome, Bilder, Favicon, manifest.json, robots.txt
const publicSrc = join(serverSrc, 'public');
const publicDist = join(serverDist, 'public');
mkdirSync(publicDist, { recursive: true });
copydir.sync(publicSrc, publicDist);

// Bootstrap
const bootstrapCssSrc = join(
    'node_modules',
    'bootstrap',
    'dist',
    'css',
    'bootstrap.min.css',
);
const cssDist = join(serverDist, 'public', 'css');
mkdirSync(cssDist, { recursive: true });
copyFileSync(bootstrapCssSrc, join(cssDist, 'bootstrap.min.css'));

const bootstrapJsSrc = join(
    'node_modules',
    'bootstrap',
    'dist',
    'js',
    'bootstrap.min.js',
);
const jsDist = join(serverDist, 'public', 'js');
mkdirSync(jsDist, { recursive: true });
copyFileSync(bootstrapJsSrc, join(jsDist, 'bootstrap.min.js'));

const jquerySrc = join('node_modules', 'jquery', 'dist', 'jquery.slim.min.js');
copyFileSync(jquerySrc, join(jsDist, 'jquery.slim.min.js'));

const popperSrc = join('node_modules', 'popper.js', 'dist', 'popper.min.js');
copyFileSync(popperSrc, join(jsDist, 'popper.min.js'));

const fontawesomeSrc = join('config', 'fontawesome', 'all.min.js');
copyFileSync(fontawesomeSrc, join(jsDist, 'all.min.js'));