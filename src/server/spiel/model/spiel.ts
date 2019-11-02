import { Document, Schema, model } from 'mongoose';
import { MAX_RATING, autoIndex, optimistic } from '../../shared';
import { isURL, isUUID } from 'validator';

export const schema = new Schema(
    {
        // MongoDB erstellt implizit einen Index fuer _id
        _id: { type: String },
        titel: { type: String, required: true, unique: true },
        rating: Number,
        art: String,
        verlag: { type: String, required: true },
        preis: { type: Number, required: true },
        rabatt: Number,
        lieferbar: Boolean,
        datum: Date,
        homepage: String,
        schlagwoerter: { type: [String], index: true },
        autoren: [Schema.Types.Mixed],
    },
    {
        toJSON: { getters: true, virtuals: false },
        timestamps: true,
        autoIndex,
    },
);

// Optimimstische Synchronisation druch das Feld __v für die Versionsnummer
schema.plugin(optimistic);

export const Spiel = model('Spiel', schema);

const isPresent = (obj: string | undefined) =>
    obj !== undefined && obj !== null;
const isEmpty = (obj: string | undefined) =>
    obj === undefined || obj === null || obj === '';

export const validateSpiel = (spiel: any) => {
    const err: any = {};
    const { titel, art, rating, verlag, homepage } = spiel;

    const spielDocument = spiel as Document;
    if (!spielDocument.isNew && !isUUID(spielDocument._id)) {
        err.id = 'Das Spiel hat eine ungueltige ID.';
    }

    if (isEmpty(titel)) {
        err.titel = 'Ein Spiel muss einen Titel haben.';
    } else if (!/^\w.*/u.test(titel)) {
        err.titel =
            'Ein Spieltitel muss mit einem Buchstaben, einer Ziffer oder _ beginnen.';
    }
    if (isEmpty(art)) {
        err.art = 'Die Art eines Spieles muss gesetzt sein';
    } else if (art !== 'BRETT' && spiel.art !== 'KARTEN') {
        err.art = 'Die Art eines Spiels muss BRETT oder KARTEN sein.';
    }
    if (isPresent(rating) && (rating < 0 || rating > MAX_RATING)) {
        err.rating = `${rating} ist keine gueltige Bewertung.`;
    }
    if (isEmpty(verlag)) {
        err.verlag = 'Der Verlag des Spiels muss gesetzt sein.';
    } else if (verlag !== 'RAVENSBURGER' && verlag !== 'SCHMIDT') {
        err.verlag =
            'Der Verlag eines Spiels muss RAVENSBURGER oder SCHMIDT sein.';
    }
    if (isPresent(homepage) && !isURL(homepage)) {
        err.homepage = `${homepage} ist keine gueltige URL.`;
    }

    // Wenn es keinen Fehler gab wird undefined returned, sonst err.
    return Object.keys(err).length === 0 ? undefined : err;
};
