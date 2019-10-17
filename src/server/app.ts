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