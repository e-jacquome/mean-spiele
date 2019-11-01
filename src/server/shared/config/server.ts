import { readFileSync } from 'fs';
import { resolve } from 'path';

const { AS_HOST, AS_PORT } = process.env; //eslint-disable-line no-process-env
const host = AS_HOST ?? 'localhost';
const portStr = AS_PORT ?? '8443';
const port = parseInt(portStr, 10);

export const SERVER_CONFIG = {
    host,
    port,
    key: readFileSync(resolve(__dirname, 'key.pem')),
    cert: readFileSync(resolve(__dirname, 'certificate.cer')),
};