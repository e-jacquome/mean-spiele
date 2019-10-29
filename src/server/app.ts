import * as RateLimit from 'express-rate-limit';
import * as compression from 'compression';
import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import * as helmet from 'helmet';
import * as morgan from 'morgan';
import * as multer from 'multer';
import * as responseTime from 'response-time';
import {
    MAX_REQUESTS_PER_WINDOW,
    WINDOW_SIZE,
    internalError,
    logRequestHeader,
    notFound,
    notYetImplemented,
    responseTimeFn,
    uploadDir,
    validateContentType,
    validateUUID,
} from './shared';
import {
    create,
    deleteFn,
    download,
    find,
    findById,
    update,
    upload,
} from './spiel/rest';
import { index, neuesSpiel, suche } from './spiel/html';
import { isAdmin, isAdminMitarbeiter, login, validateJwt } from './auth/rest';
// Einlesen von application/json im Request-Rumpf
// Fuer multimediale Daten (Videos, Bilder, Audios): raw-body
import { json, urlencoded } from 'body-parser';
import { graphqlSchema } from './spiel/graphql/graphqlSchema';
import { helmetHandlers } from './security';
import { join } from 'path';

const { Router } = express;