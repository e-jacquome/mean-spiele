/* eslint-disable max-params */

import * as validator from 'validator';
import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from './httpStatus';
import { inspect } from 'util';
import { logger } from './logger';

class SharedRequestHandler {
    private static readonly SPACE = 2;

    logRequestHeader(req: Request, _: Response, next: NextFunction) {
        logger.debug(
            `Request: headers=${JSON.stringify(
                req.headers,
                undefined,
                SharedRequestHandler.SPACE,
            )}`,
        );
        logger.debug(
            `Request: protocol=${JSON.stringify(
                req.protocol,
                undefined,
                SharedRequestHandler.SPACE,
            )}`,
        );
        logger.debug(
            `Request: hostname=${JSON.stringify(
                req.hostname,
                undefined,
                SharedRequestHandler.SPACE,
            )}`,
        );
        if (req.body !== undefined) {
            logger.debug(
                `Request: body=${JSON.stringify(
                    req.body,
                    undefined,
                    SharedRequestHandler.SPACE,
                )}`,
            );
        }
        Object.keys(req).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(req, key)) {
                logger.log('silly', `Request-Key: ${key}`);
            }
        });
        next();
    }

    validateUUID(_: Request, res: Response, next: NextFunction, id: any) {
        if (validator.isUUID(id)) {
            logger.debug('SharedRequestHandler.validateUUID(): isUUID');
            next();
            return;
        }

        logger.debug('SharedRequestHandler.validateUUID(): status=BAD_REQUEST');
        res.status(HttpStatus.BAD_REQUEST).send(
            `${id} ist keine gueltige Spiel-ID`,
        );
    }

    validateContentType(req: Request, res: Response, next: NextFunction) {
        const contentType = req.header('Content-Type');
        if (contentType === undefined || validator.isMimeType(contentType)) {
            logger.debug('SharedRequestHandler.validateContentType(): ok');
            next();
            return;
        }

        logger.debug(
            'SharedRequestHandler.validateContentType(): status=BAD_REQUEST',
        );
        res.status(HttpStatus.BAD_REQUEST).send(
            `${contentType} ist kein gueltiger MIME-Typ`,
        );
    }

    notFound(_: Request, res: Response) {
        res.sendStatus(HttpStatus.NOT_FOUND);
    }

    internalError(err: any, _: Request, res: Response) {
        logger.error(
            `SharedRequestHandler.internalError(): error=${inspect(err)}`,
        );
        res.sendStatus(HttpStatus.INTERNAL_ERROR);
    }

    notYetImplemented(_: Request, res: Response) {
        logger.error('SharedRequestHandler.notYetImplemented()');
        res.sendStatus(HttpStatus.NOT_YET_IMPLEMENTED);
    }
}
const handler = new SharedRequestHandler();

// Exportierte Funktionen

export const logRequestHeader = (
    req: Request,
    res: Response,
    next: NextFunction,
) => handler.logRequestHeader(req, res, next);

export const validateContentType = (
    req: Request,
    res: Response,
    next: NextFunction,
) => handler.validateContentType(req, res, next);

export const validateUUID = (
    req: Request,
    res: Response,
    next: NextFunction,
    id: any,
) => handler.validateUUID(req, res, next, id);

export const notFound = (req: Request, res: Response) =>
    handler.notFound(req, res);

export const internalError = (err: any, req: Request, res: Response) =>
    handler.internalError(err, req, res);

export const notYetImplemented = (req: Request, res: Response) =>
    handler.notYetImplemented(req, res);

export const wrap = (fn: any) => (...args: Array<any>) =>
    fn(...args).catch(args[2]);
