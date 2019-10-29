import * as uuid from 'uuid/v4';
import { spiel, spiele } from './spiel';
import { Document } from 'mongoose';
import { logger } from '../../../shared';

export class SpielServiceMock {
    async findById(id: string) {
        spiel._id = id;
        return this.toSpielDocument(spiel);
    }

    async find(_?: any) {
        return spiele.map(s => this.toSpielDocument(s));
    }

    async create(doc: Document) {
        doc._id = uuid();
        logger.info(`Neues Spiel: ${JSON.stringify(doc)}`);
        return doc;
    }

    async update(doc: Document) {
        if (doc.__v !== undefined) {
            doc.__v++;
        }
        logger.info(`Aktualisiertes Spiel: ${JSON.stringify(doc)}`);
        return Promise.resolve(doc);
    }

    async remove(id: string) {
        logger.info(`ID des geloeschten Buches: ${id}`);
    }

    private readonly toSpielDocument = (spielJSON: any): Document =>
        new Promise((resolve, _) => resolve(spielJSON)) as any;
}