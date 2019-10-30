import { IResolverObject } from 'graphql-tools/dist/Interfaces';
import { Spiel } from '../model/spiel';
import { SpielService } from '../service/spiel.service';

const spielService = new SpielService();

// eslint-disable-next-line arrow-body-style
const findSpiele = (titel: string) => {
    return titel === undefined
        ? spielService.find({})
        : spielService.find({ titel });
};
const query: IResolverObject = {
    spiele: (_: unknown, { titel }: any) => findSpiele(titel),
    spiel: (_: unknown, { id }: any) => spielService.findById(id),
};

interface ISpiel {
    _id?: string;
    titel: string;
    rating?: number;
    art?: string;
    verlag: string;
    preis: number;
    rabatt?: number;
    lieferbar?: boolean;
    datum?: string | Date;
    homepage?: string;
    schlagwoerter?: Array<string>;
    version: number;
}

const createSpiel = (spiel: ISpiel) => {
    spiel.datum = new Date(spiel.datum as string);
    const spielDocument = new Spiel(spiel);
    return spielService.create(spielDocument);
};

const updateSpiel = (spiel: ISpiel) => {
    spiel.datum = new Date(spiel.datum as string);
    const spielDocument = new Spiel(spiel);
    return spielService.update(spielDocument, spiel.version.toString());
};
const deleteSpiel = async (id: string) => {
    await spielService.remove(id);
};

const mutation: IResolverObject = {
    createSpiel: (_: unknown, spiel: ISpiel) => createSpiel(spiel),
    updateSpiel: (_: unknown, spiel: ISpiel) => updateSpiel(spiel),
    deleteSpiel: (_: unknown, { id }: any) => deleteSpiel(id),
};

export const resolvers = {
    Query: query,
    Mutation: mutation,
};
