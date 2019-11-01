import * as fs from 'fs';
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
});

// PEM-Dateien fuerr JWT kopieren
const jwtPemSrc = path.join(serverSrc, 'auth', 'service', 'jwt');
const jwtPemDist = path.join(serverDist, 'auth', 'service', 'jwt');
fs.copy(jwtPemSrc, jwtPemDist, err => {
    if (err !== undefined && err !== null) {
        console.error(err);
    }
});

// PEM- und Zertifikatsdateien fuer HTTPS kopieren
const httpsSrc = path.join(config, 'https');
const httpsDist = path.join(serverDist, 'shared', 'config');
fs.copy(httpsSrc, httpsDist, err => {
    if (err !== undefined && err !== null) {
        console.error(err);
    }
});

// Zertifikatsdatei fuer MongoDB kopieren
const mongoSrc = path.join(config, 'db', 'mongodb.cer');
const mongoDist = path.join(serverDist, 'shared', 'config', 'certificate.cer');
fs.copy(mongoSrc, mongoDist, err => {
    if (err !== undefined && err !== null) {
        console.error(err);
    }
});

// Konfig-Dateien fuer Nodemon kopieren
const nodemonSrc = path.join(config, 'nodemon');
fs.copy(nodemonSrc, serverDist, err => {
    if (err !== undefined && err !== null) {
        console.error(err);
    }
});

//---------------------------------------------------------------
// E J S
//--------------------------------------------------------------

// Views mit Partials
const viewsSrc = path.join(serverSrc, 'views');
const viewsDist = path.join(serverDist, 'views');
fs.copy(viewsSrc, viewsDist, err => {
    if (err !== undefined && err !== null) {
        console.error(err);
    }
});

// Fontawesome, Bilder, Favicon, manifest.json, robots.text
const publicSrc = path.join(serverSrc, 'path');
const publicDist = path.join(serverDist, 'public');
fs.copy(publicSrc, publicDist, err => {
    if (err !== undefined && err !== null) {
        console.error(err);
    }
});

// Bootstrap
const bootstrapCssSrc = path.join(
    'node_modules',
    'bootstrap',
    'dist',
    'css',
    'bootstrap.min.css',
);
const bootstrapCssDist = path.join(
    serverDist,
    'public',
    'css',
    'bootstrap.min.js',
);
fs.copy(bootstrapCssSrc, bootstrapCssDist, err => {
    if (err !== undefined && err !== null) {
        console.error(err);
    }
});
const bootstrapJsSrc = path.join(
    'node_modules',
    'bootstrap',
    'dist',
    'js',
    'bootstrap.min.js',
);
const bootstrapJsDist = path.join(
    serverDist,
    'public',
    'js',
    'bootstrap.min.js',
);
fs.copy(bootstrapJsSrc, bootstrapJsDist, err => {
    if (err !== undefined && err !== null) {
        console.error(err);
    }
});
const jquerySrc = path.join(
    'node_modules',
    'jquery',
    'dist',
    'jquery.slim.min.js',
);
const jqueryDist = path.join(serverDist, 'public', 'js', 'jquery.slim.min.js');
fs.copy(jquerySrc, jqueryDist, err => {
    if (err !== undefined && err !== null) {
        console.error(err);
    }
});
const popperSrc = path.join(
    'node_modules',
    'popper.js',
    'dist',
    'popper.min.js',
);
const popperDist = path.join(serverDist, 'public', 'js', 'popper.min.js');
fs.copy(popperSrc, popperDist, err => {
    if (err !== undefined && err !== null) {
        console.error(err);
    }
});

const fontawesomeSrc = path.join('config', 'fontawesome', 'all.min.js');
const fontawesomeDist = path.join(serverDist, 'public', 'js', 'all.min.js');
fs.copy(fontawesomeSrc, fontawesomeDist, err => {
    if (err !== undefined && err !== null) {
        console.error(err);
    }
});
