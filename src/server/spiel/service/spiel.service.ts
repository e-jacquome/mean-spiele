import * as uuid from 'uuid/v4';
import { Spiel, validateSpiel } from '../model/spiel';
import {
    SpielNotExistsError,
    TitelExistsError,
    ValidationError,
    VersionInvalidError,
} from './exceptions';
import { Document, startSession } from 'mongoose';
import { logger, mockDB } from '../../shared';
import { SpielServiceMock, spiel } from './mock';
import { buildSchema } from 'graphql';

export class SpielService {
    private readonly mock: SpielServiceMock | undefined;

    constructor() {
        if (mockDB) {
            this.mock = new SpielServiceMock();
        }
    }

    async findById(id: string) {
        if (this.mock !== undefined) {
            return this.mock.findById(id);
        }
        logger.debug(`SpielService.findById(): id= ${id}`);
        //Pattern "Active Record" 
        return Spiel.findById(id);
    }

    async find(query?: any) {
        if (this.mock !== undefined) {
            return this.mock.find(query);
        }

        logger.debug(`SpielService.find(): query= ${query}`);
        const tmpQuery = Spiel.find();

        if (query === undefined || Object.keys(query).length === 0) {
            return tmpQuery.sort('titel');
        }

        const { titel, solo, team, ...dbQuery } = query;

        //JSON-Objekt von Express asynchron suchen
        if (titel !== undefined ) {
            //Titel in der Query auch Teilstring des Titels möglich,
            //Regulärer Ausdruck i = incase sensitive, u = unicode support
            dbQuery.titel = RegExp(titel, 'iu');
        }

        if (solo === 'true') {
            dbQuery.schlagwoerter = ['SOLO'];
        }
        if (team === 'true') {
            if (dbQuery.schlagwoerter === undefined) {
                dbQuery.schlagwoerter = ['TEAM'];
            } else {
                dbQuery.schlagwoerter.push('TEAM');
            }
        }

        logger.debug(`SpielService.find(): dbQuery=${dbQuery}`);

        return Spiel.find(dbQuery);
    }
    
    async create(spiel: Document) {
        if (this.mock !== undefined) {
            return this.mock.create(spiel);
        }

        const err = validateSpiel(spiel);
        if (err !== undefined) {
            const message = JSON.stringify(err);
            logger.debug(
                `SpielService.create(): Vaidation Message: ${message}`,
            );
            //Promise<void> als Returntype
            return Promise.reject(new ValidationError(message));
        }

        const session = await startSession();
        session.startTransaction();

        const { titel }: { titel: string } = spiel as any;
        let tmp = await Spiel.findOne({ titel }); 
        if (tmp !== null) {
            return Promise.reject(
                new TitelExistsError(`Der Titel "${titel}" existiert bereits.`),
            );
        }

        spiel._id = uuid();
        const spielSaved = await spiel.save();

        await session.commitTransaction();
        session.endSession();

        logger.debug(
            `SpielService.create(): spielSaved=${JSON.stringify(spielSaved)}`
        );

        return spielSaved;
    }

    async update(spiel: Document, versionStr: string) {
        if (this.mock !== undefined) {
            return this.mock.update(spiel);
        }
        if (versionStr === undefined) {
            return Promise.reject(
                new VersionInvalidError('Die Versionsnummer fehlt'),
            );
        }
        const version = Number.parseInt(versionStr, 10);
        if (Number.isNaN(version)) {
            return Promise.reject(
                new VersionInvalidError('Die Versionsnummer ist ungueltig.'),
            );
        }
        logger.debug(`SpielService.update(): version${version}`);

        logger.debug(`SpielService.update(): spiel=${JSON.stringify(spiel)} `);
        const err = validateSpiel(spiel);
        if (err !== undefined) {
            const message = JSON.stringify(err);
            logger.debug(
                `SpielService.update(): Validation Message: ${message}`,
            );
            return Promise.reject(new ValidationError(message));
        }

        const { titel }: { titel: string } = spiel as any;
        const tmp = await Spiel.findOne ({ titel });
        if (tmp !== null && tmp._id !== spiel._id) {
            return Promise.reject(
                new TitelExistsError(
                    `Der Titel "${titel}" existiert bereits bei ${tmp._id}.`,
                ),
            );
        }

        const spielDb = await Spiel.findById(spiel._id);
        if (spielDb === null) {
            return Promise.reject(
                new SpielNotExistsError(`Kein Spiel mit ID ${buch._id}`),
            );
        }
        if (version < spielDb.toObject().__v) {
            return Promise.reject(
                new VersionInvalidError(
                    `Die Versionsnummer ${version} ist nicht aktuell`,
                ),
            );
        }

        const result = await Spiel.findByIdAndUpdate(spiel._id, spiel);
        if (result === null) {
            return Promise.reject(
                new VersionInvalidError(
                    `Kein Spiel mit ID ${spiel._id} und Version ${version}`,
                ),
            );
        }

        logger.debug(`SpielService.update(): result=${JSON.stringify(result)}`);
        return Promise.resolve(result);
    }

    async remove(id: string) {
        if (this.mock !== undefined) {
            return this.mock.remove(id);
        }

        logger.debug(`SpielService.remove(): id=${id}`);

        const spielPromise = Spiel.findByIdAndRemove(id);

        return spielPromise.then(spiel => 
            logger.debug(
                `SpielService.remove(): geloescht=${JSON.stringify(spiel)}`,
            ),
        );
    }
}


