import { logger } from '../../shared';

export class ValidationError implements Error {
    name = 'ValidationError';

    constructor(public message: string) {
        logger.debug(`ValidationError.constructor(): ${message}`);
    }
}

export class TitelExistsError implements Error {
    name = 'TitelExistsError';

    constructor(public message: string) {
        logger.debug(`TitelExistsError.constructor(): ${message}`);
    }
}

export class VersionInvalidError implements Error {
    name = 'VersionInvalidError';

    constructor(public message: string) {
        logger.debug(`VersionInvalidError:constructor(): ${message}`);
    }
}

export class SpielNotExistsError implements Error {
    name = 'SpielNotExistsError';

    constructor(public message: string) {
        logger.debug(`SpielNotExistsError.constructor(): ${message}`);
    }
}