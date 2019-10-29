import { logger } from '../../shared';

export class AuthorizationInvalidError implements Error {
    name = 'AuthorizationInvalidError';

    constructor(public message: string) {
        logger.silly('AuthorizationInvalidError.constructor()');
    }
}

export class TokenInvalidError implements Error {
    name = 'TokenInvalidError';

    constructor(public message: string) {
        logger.silly('TokenInvaidError.constructor()');
    }
}

export class TokenExpiredError implements Error {
    name = 'TokenExpiredError';

    constructor(public message: string) {
        logger.silly('TokenExiredError.constructor()');
    }
}
