import { createLogger, format, transports } from 'winston';

//Verschiedene Log-Levels: error, warn, info, debug, verbose, silly,...
//Transports https://github.com/winstonjs/winston/blob/master/docs/transports.md

const { combine, simple, timestamp } = format;

const commonFormat = combine(timestamp(), simple());

const { NODE_ENV } = process.env;
const consoleOptions = { level: NODE_ENV === 'production' ? 'error' : 'info' };
const fileOptions = {
    filename: 'server.log',
    level: 'debug',
    maxxize: 250000,
    maxFiles: 3,
};

const { Console, File } = transports;
export const logger = createLogger({
    format: commonFormat,
    transports: [new Console(consoleOptions), new File(fileOptions)],
});

if (NODE_ENV === 'production') {
    logger.info('Loggins durch Winston ist konfiguriert');
} else {
    logger.debug('Logging durch Winston ist konfiguriert: Level Info');
}
