/* eslint-disable no-unused-expressions,max-lines,max-lines-per-function,no-underscore-dangle */
/* globals describe, it, before */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
//Wir benutzen Mocha als Testrunner und für Assertions Chai

import * as chai from 'chai';
import * as http from 'http';
import * as request from 'supertest';
import {
    HttpStatus,
    SERVER_CONFIG,
    connectDB,
    logger,
} from '../../../server/shared';
import { PATHS, app } from '../../../server/app';
import stringify from 'fast-safe-stringify';

import('chai-string')
    .then(chaiString => chai.use(chaiString))
    .catch(err => {
        logger.error(`${stringify(err)}`);
        process.exit(1); // eslint-disable-line no-process-exit
    });

// Testserver mit HTTP und Random Port
const { host } = SERVER_CONFIG;

let server: http.Server;
 before(async () => {
     await connectDB();

     server = app.listen(0, host, () => {
         logger.info(`Node ${process.version}`);
         const address = server.address();
         if (address !== null && typeof address !== 'string') {
             logger.info(
                 `Testserver läuft: http://${host}:${address.port}`,
             );
         }
         server.emit('testServerStarted');
     });
 });

// Testdaten

const idGetVorhanden = '00000000-0000-0000-0000-000000000001';
const idNichtVorhanden = '00000000-0000-0000-0000-000000000999';

const neuesSpiel: object = {
    titel: 'Halli Galli',
    rating: 1,
    art: 'KARTEN',
    verlag: 'RAVENSBURGER',
    preis: 80.04,
    rabatt: 0.099,
    lieferbar: true,
    datum: '2017-05-20',
    homepage: 'https://halli.de/',
    schlagwoerter: ['SOLO'],
    autoren: [{ nachname: 'Halli', vorname: 'Galli' }],
};
const neuesSpielInvalid: object = {
    titel: 'FalschesSpiel',
    rating: -1,
    art: 'COMPUTER',
    verlag: 'NICHT_VERLAG',
    preis: 0,
    rabatt: 0,
    lieferbar: true,
    datum: '2016-02-01',
    autoren: [{ nachname: 'Falsches', vorname: 'Spiel' }],
    schlagwoerter: [],
};
const neuesSpielTitelExistiert: object = {
    titel: 'Alpha',
    rating: 1,
    art: 'DRUCKAUSGABE',
    verlag: 'HSKA_VERLAG',
    preis: 99.99,
    rabatt: 0.099,
    lieferbar: true,
    datum: '2016-02-28',
    isbn: '0-0070-9732-8',
    autoren: [{ nachname: 'Test', vorname: 'Theo' }],
    schlagwoerter: ['SOLO', 'TEAM'],
};

const geaendertesBuch: object = {
    titel: 'Geaendert',
    rating: 1,
    art: 'DRUCKAUSGABE',
    verlag: 'HSKA_VERLAG',
    preis: 33.33,
    rabatt: 0.033,
    lieferbar: true,
    datum: '2016-02-03',
    homepage: 'https://test.te',
    autoren: [{ nachname: 'Gamma', vorname: 'Claus' }],
    schlagwoerter: ['JAVASCRIPT', 'TYPESCRIPT'],
};
const idPutVorhanden = '00000000-0000-0000-0000-000000000003';

const geaendertesBuchIdNichtVorhanden: object = {
    titel: 'Nichtvorhanden',
    rating: 1,
    art: 'DRUCKAUSGABE',
    verlag: 'HSKA_VERLAG',
    preis: 33.33,
    rabatt: 0.033,
    lieferbar: true,
    datum: '2016-02-03',
    autoren: [{ nachname: 'Gamma', vorname: 'Claus' }],
    schlagwoerter: ['JAVASCRIPT', 'TYPESCRIPT'],
};
const idPutNichtVorhanden = '00000000-0000-0000-0000-000000000999';

const geaendertesBuchInvalid: object = {
    titel: 'Alpha',
    rating: -1,
    art: 'UNSICHTBAR',
    verlag: 'NO_VERLAG',
    preis: 0.01,
    rabatt: 0,
    lieferbar: true,
    datum: '2016-02-01',
    isbn: 'falsche-ISBN',
    autoren: [{ nachname: 'Test', vorname: 'Theo' }],
    schlagwoerter: [],
};

const idDeleteVorhanden = '00000000-0000-0000-0000-000000000005';

const loginDaten: object = {
    username: 'admin',
    password: 'p',
};