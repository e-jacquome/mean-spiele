export const alg = 'RS256';

export const JWT_CONFIG = {
    encoding: 'utf8',
    // JuergenZimmermann
    issuer: 'https://hska.de/shop/EricJacquome',
    secret: 'p',
    // 1 Tag in Sekunden
    expiration: 24 * 60 * 60,  // eslint-disable-line @typescript-eslint/no-magic-numbers
    bearer: 'Bearer',
};
