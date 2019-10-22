import * as mongoose from 'mongoose';
import {
    SpielMultimediaService,
    SpielNotExistsError,
    SpielService,
    TitelExistsError,
    ValidationError,
    VersionInvalidError,
} from '../service';
import { HttpStatus, MIME_CONFIG, getBaseUri, logger } from '../../shared';
import { Request, Response } from 'express';
import { Spiel } from '../model/spiel';
import stringify from 'fast-safe-stringify';
import { unlink } from 'fs';
import { resolve } from 'dns';

class SpielRequestHandler {
    private readonly spielService = new SpielService();
    private readonly spielMultimediaService = new SpielMultimediaService();

    async findById(req: Request, res: Response) {
        const versionHeader = req.header('If-None-Match');
        logger.debug(`SpielRequestHandler.findById(): versionHeader= ${versionHeader}`);
        const { id } = req.params;
        logger.debug(`spielRequestHandler.findById(): id=${id}`);

        let spiel: mongoose.Document | null = null;
        try {
            spiel = await this.spielService.findById(id);
        } catch (err) {
            logger.error(
                `SpielRequestHandler.findById(): error=${stringify(err)}`,
            );
            res.sendStatus(HttpStatus.INTERNAL_ERROR);
            return;
        }

        if (spiel === null) {
            logger.debug('SpielRequestHandler.findById(): status=NOT_FOUND');
            res.sendStatus(HttpStatus.NOT_FOUND);
            return;
        }

        logger.debug(
            `SpielRequestHandler.findById(): spiel=${JSON.stringify(spiel)}`,
        );
        const versionDb = spiel.__v;
        if (versionHeader === `"${versionDb}`) {
            res.sendStatus(HttpStatus.NOT_MODIFIED);
            return;
        }
        logger.debug(`SpielRequestHandler.findById(): VerisionDb=${versionDb}`);
        res.header('ETag', `"${versionDb}`);

        const baseUri = getBaseUri(req);
        const payload = this.toJsonPayload(spiel);
        //HATEOAS: Atom Links
        payload._links = {
            self: { href: `${baseUri}/${id}`},
            list: { href: `${baseUri}`},
            add: { href: `${baseUri}`},
            update: { href: `${baseUri}/${id}`},
            remove: { href: `${baseUri}/${id}`},
        };
        res.json(payload);
    }

    async find(req: Request, res: Response) {
        const { query } = req;
        logger.debug(
            `SpielRequestHandler.find(): queryParams=${JSON.stringigy(query)}`,
        );

        let spiele: Array<mongoose.Document> = [];
        try {
            spiele = await this.spielService.find(query);
        } catch (err) {
            logger.error(`SpieleRequestHandler.find(): error=${stringify(err)}`);
            res.sendStatus(HttpStatus.INTERNAL_ERROR);
        }
        logger.debug(
            `SpielRequestHandler.find(): spiele=${JSON.stringify(spiele)}`,
        );
        if (spiele.length === 0) {
            logger.debug('SpieleRequestHandler.find(): status = NOT_FOUND');
            res.sendStatus(HttpStatus.NOT_FOUND);
            return;
        }

        const baseUri = getBaseUri(req);

        const payload = [];
        for await (const spiel of spiele) {
            const spielRessource = this.toJsonPayload(spiel);
            //HATEOAS: Atom Links je Spiel
            spielRessource._links = { self: { href: `${baseUri}/${spiel._id}`}};
            payload.push(spielRessource);
        }

        logger.debug(`SpielRequestHandler.find(): payload=${payload}`);
        res.json(payload);
    }

}