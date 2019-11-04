import * as minimist from 'minimist';
import * as path from 'path';
import * as shell from 'shelljs';
// @ts-ignore
import * as slash from 'slash';
const argv = minimist(process.argv.slice(0));
const values = argv._;

const db = '-d hska';
const auth = '--username admin --password p --authenticationDatabase admin';
const pemFile = 'C:/Zimmermann/mongodb/key.pem';
const tls =
    '--tls --host localhost --tlsAllowInvalidCertifications ' +
    `--tlsCAFile ${pemFile}`;
const ssl =
    '--ssl --host localhost --sslAllowInvalidCertificates ' +
    `--sslCAFile ${pemFile}`;

const mongostart = () => {
    const configFile = 'C:/Zimmermann/mongodb/config.yml';

    shell.exec(`mongod --version && mongod --config ${configFile}`);
};

const mongostop = () => {
    const norc = '--norc admin';
    shell.exec(
        `mongo --eval "db.shutdownServer({force: true})" ${auth} ${norc} ${tls}`,
    );
};

const mongoimport = () => {
    const host = '-h localhost';
    const dbDir = 'config/db';
    shell.exec(
        `mongoimport --verbose ${db} ${auth} ${ssl} --stopOnError --drop ` +
            `  --file ${dbDir}/Spiel.json --maintainInsertionOrder && ` +
            `mongofiles --verbose ${db} ${auth} ${ssl} --replace ${host} ` +
            '  --local config/rest/binary/image.png --type image/png put ' +
            '  00000000-0000-0000-0000-000000000001',
    );
};

const mongoexport = () => {
    shell.exec(
        `mongoexport --verbose ${db} ${auth} ${ssl} --collection Spiel ` +
            '--out EXPORT.Spiel.json --pretty',
    );
};

const mongoexpress = () => {
    const httpsDir = slash(path.join(__dirname, '..', 'config', 'https'));
    const key = slash(path.join(httpsDir, 'key.pem'));
    const certExpress = slash(path.join(httpsDir, 'certificate.cer'));

    const mongoExpressEnv =
        'SET VCAP_APP_PORT=8088' +
        '&& SET ME_CONFIG_MONGODB_SERVER=localhost' +
        '&& SET ME_CONFIG_MONGODB_ENABLE_ADMIN=true' +
        '&& SET ME_CONFIG_MONGODB_ADMINUSERNAME=admin' +
        '&& SET ME_CONFIG_MONGODB_ADMINPASSWORD=p' +
        '&& SET ME_CONFIG_MONGODB_AUTH_DATABASE=admin' +
        '&& SET ME_CONFIG_MONGODB_AUTH_USERNAME=admin' +
        '&& SET ME_CONFIG_MONGODB_AUTH_PASSWORD=p' +
        '&& SET ME_CONFIG_MONGODB_SSL=true' +
        '&& SET ME_CONFIG_MONGODB_SSLVALIDATE=false' +
        '&& SET ME_CONFIG_BASICAUTH_PASSWORD=p' +
        '&& SET ME_CONFIG_SITE_GRIDFS_ENABLED=true' +
        '&& SET ME_CONFIG_SITE_SSL_ENABLED=true' +
        `&& SET ME_CONFIG_SITE_SSL_KEY_PATH=${key}` +
        `&& SET ME_CONFIG_SITE_SSL_CRT_PATH=${certExpress}`;

    // ggf. --version
    shell.exec(
        `${mongoExpressEnv}&& cd node_modules\\mongo-express && node app.js`,
    );
};

module.exports = { mongoimport };

switch (values[2]) {
    case 'stop':
        mongostop();
        break;
    case 'import':
        mongoimport();
        break;
    case 'export':
        mongoexport();
        break;
    case 'express':
    case 'mongoexpress':
        mongoexpress();
        break;
    case 'start':
    default:
        mongostart();
}
