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

//

const rateLimitOptions: RateLimit.Options = {
    windowMs: WINDOW_SIZE,
    max: MAX_REQUESTS_PER_WINDOW,
};
const limiter = new RateLimit(rateLimitOptions);
const uploader = multer({ dest: uploadDir });

export const PATHS = {
    spiele: '/spiele',
    verlag: '/verlag',
    login: '/login',
    graphql: '/api',
    html: '/html',
};
// Das App- bzw. Express-Objekt ist zustaendig fuer:
//  * Konfiguration der Middleware
//  * Routing
// http://expressjs.com/en/api.html
class App {
    readonly app = express();

    constructor() {
        this.config();
        this.routes();
    }

    private config() {
        // eslint-disable-next-line no-process-env
        if (process.env.NODE_ENV === 'development') {
            this.app.use(
                morgan('dev'),
                responseTime(responseTimeFn),
                logRequestHeader,
            );
        } else {
            this.app.use(helmet.hidePoweredBy());
        }

        this.app.use(...helmetHandlers, compression(), limiter);
    }

    private routes() {
        this.spieleRoutes();
        this.verlagRoutes();
        this.loginRoutes();
        this.spielGraphqlRoutes();
        this.htmlRoutes();

        this.app.get('*', notFound);
        this.app.use(internalError);
    }

    private spieleRoutes() {
        const router = Router(); // eslint-disable-line new-cap
        router
            .route('/')
            .get(find)
            .post(
                validateJwt,
                validateContentType,
                isAdminMitarbeiter,
                json(),
                create,
            );

        const idParam = 'id';
        router
            .param(idParam, validateUUID)
            .get(`/:${idParam}`, findById)
            .put(
                `/${idParam}`,
                validateJwt,
                validateContentType,
                isAdminMitarbeiter,
                json(),
                update,
            )
            .delete(`/:${idParam}`, validateJwt, isAdmin, deleteFn)
            .put(
                `/:${idParam}/media`,
                validateJwt,
                isAdminMitarbeiter,
                uploader.single('file'),
                upload,
            )
            .get(`/:${idParam}/media`, download);

        this.app.use(PATHS.spiele, router);
    }

    private verlagRoutes() {
        const router = Router(); // eslint-disable-line new-cap
        router.get('/', notYetImplemented);
        this.app.use(PATHS.verlag, router);
    }

    private loginRoutes() {
        const router = Router(); // eslint-disable-line new-cap
        router.route('/').post(
            urlencoded({
                extended: false,
                type: 'application/x-www-form-urlencoded',
            }),
            login,
        );
        this.app.use(PATHS.login, router);
    }

    private spielGraphqlRoutes() {
        const middelware = graphqlHTTP({
            schema: graphqlSchema,
            graphiql: true,
        });
        this.app.use(PATHS.graphql, middelware);
    }

    private htmlRoutes() {
        const router = Router(); // eslint-disable-line new-cap
        router.route('/').get(index);
        router.route('/suche').get(suche);
        router.route('/neues-spiel').get(neuesSpiel);

        this.app.use(PATHS.html, router);
        this.app.set('view engine', 'ejs');
        this.app.set('views', join(__dirname, 'views'));
        this.app.use(express.static(join(__dirname, 'public')));
    }
}
export const { app } = new App();
