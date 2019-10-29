import {
    AuthService,
    AuthorizationInvalidError,
    TokenExpiredError,
    TokenInvalidError,
} from '../service';
import { HttpStatus, logger } from '../../shared';
import { NextFunction, Request, Response } from 'express';

class AuthenticationRequestHandler {
    private readonly authService = new AuthService();

    async login(req: Request, res: Response) {
        const loginResult = await this.authService.login(req);
        if (loginResult === undefined) {
            logger.debug(`AuthRequestHandler.login(): 401`);
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        logger.debug(
            `AuthRequestHandler.login(): ${JSON.stringify(loginResult)}`,
        );
        res.json(loginResult).status(HttpStatus.OK);
    }

    validateJwt(req: Request, res: Response, next: NextFunction) {
        try {
            this.authService.validateJwt(req);
        } catch (err) {
            if (
                err instanceof TokenInvalidError ||
                err instanceof AuthorizationInvalidError
            ) {
                logger.debug (
                    `AuthRequestHandler.validateJwt(): 401: ${err.name}, ${err.message}`,
                );
                res.sendStatus(HttpStatus.UNAUTHORIZED);
                return;
            }
            if (err instanceof TokenExpiredError) {
                logger.debug(`AuthRequestHandler.validateJwt(): 401`);
                res.header ( 
                    'WWW-Authenticate',
                    'Bearer realm = "hska.de", error="invalid_token", error_description="The access token expired"',
                );
                res.status(HttpStatus.UNAUTHORIZED).send(
                    'The access token expired',
                );
                return;
            }

            res.sendStatus(HttpStatus.INTERNAL_ERROR);
            return;
        }

        logger.debug(`AuthRequestHandler.validateJwt(): ok`);
        next();
    }

    isLoggedIn(req: Request, res: Response, next: NextFunction) {
        if (!this.authService.isLoggedIn(req)) {
            logger.debug(`AuthRequestHandler.isLoggedIn(): 401`);
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        logger.debug(`AuthRequestHAndler.isLoggedIn(): ok`);
        next();
    }
}

const handler= new AuthenticationRequestHandler();

export const login = (req: Request, res: Response) => handler.login(req, res);

export const validateJwt = (req: Request, res: Response, next: NextFunction) =>
    handler.validateJwt(req, res, next);

export const isLoggedIN = (req: Request, res: Response, next: NextFunction) =>
    handler.isLoggedIn(req, res, next);
