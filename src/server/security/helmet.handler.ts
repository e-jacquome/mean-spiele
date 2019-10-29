//Eine Alternative wäre Lusca
import * as helmet from 'helmet';

export const helmetHandlers = [
    /* eslint-disable quotes */
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["https: 'self'"],
            styleSrc: ["https: 'unsafe-inline'"],
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src
            // prettier-ignore
            scriptSrc: ["https: 'unsafe-inline' 'unsafe-eval'"],
            imgSrc: ["data: 'self'"],
        },
    }),
    helmet.xssFilter(),
    helmet.frameguard(),
    helmet.hsts(),
    helmet.noSniff(),
    helmet.noCache(),
];
