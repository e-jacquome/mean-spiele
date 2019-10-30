import 'source-map-support/register';
import * as http from 'http';
import * as https from 'https';
import * as os from 'os';
import { SERVER_CONFIG, connectDB, logger } from './shared';
import { app } from './app';
import { connection } from 'mongoose';

const { cert, host, key, port } = SERVER_CONFIG;
const credentials = { key, cert };

const sigintCb = () => {
    logger.info('Server wird heruntergefahren...');
    connection.close(() => process.exit(0)); // eslint-disable-line no-process-exit,@typescript-eslint/no-floating-promises
};

const unhandledRejectionCb = (err: any) => {
    logger.error(err);
    logger.info(
        'Verbindung zu MongoDB wird wegen "unhandleRejection" geschlossen.',
    );
    connection.close(() => process.exit(2)); // eslint-disable-line no-process-exit,@typescript-eslint/no-floating-promises
};

const startServer = () => {
    https
        .createServer(credentials, app as http.RequestListener)
        .listen(port, () => {
            const banner =
                '\n' +
                '_________ _____ ______   \n' +
                '|_  | ___   __ | ___   \n' +
                '  | | |_/ / |  /| |_/ / \n' +
                '  | | ___  | __ | ___  \n' +
                '/__/ / |_/ / |_ | |_/ / \n' +
                '____/____/ ____/____/  \n' +
                '\n';
            logger.info(banner);
            logger.info(`NodeVersion:     ${process.version}`);
            logger.info(`Betriebssystem:  ${os.type()} ${os.release()}`);
            logger.info(`Rechnername:     ${os.hostname()}`);
            logger.info(
                `https://${host}:${port} ist gestartet: Herunterfahren durch druch Str<C>`,
            );
        });
    process.on('SIGINT', sigintCb);
    process.on('unhandledRejection', unhandledRejectionCb);
};

connectDB()
    .then(startServer)
    .catch(() => {
        logger.error('Fehler bei Aufbau der DB-Verbindung');
    });
