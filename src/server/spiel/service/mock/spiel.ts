export const spiel: any = {
    _id: '00000000-0000-0000-0000-000000000001',
    titel: 'Skat',
    rating: 4,
    art: 'KARTEN',
    verlag: 'RAVENSBURGER',
    preis: 11.1,
    rabatt: 0.011,
    lieferbar: true,
    datum: new Date('2019-10-10T00:00:00.000Z'),
    homepage: 'https://skat.de',
    schlagwoerter: ['TEAM'],
    autoren: [
        {
            nachname: 'Skat',
            vorname: 'Sandra',
        },
        {
            nachname: 'Skat',
            vorname: 'Sabine',
        },
    ],
    __v: 0,
    createdAt: 0,
    updatedAt: 0,
};

export const spiele = [
    spiel,
    {
        _id: '00000000-0000-0000-0000-000000000002',
        titel: 'Poker',
        rating: 4,
        art: 'KARTEN',
        verlag: 'RAVENSBURGER',
        preis: 22.7,
        rabatt: 0.011,
        lieferbar: true,
        datum: new Date('2019-10-10T00:00:00.000Z'),
        homepage: 'https://poker.de',
        schlagwoerter: ['SOLO'],
        autoren: [
            {
                nachname: 'Poker',
                vorname: 'Paul',
            },
            {
                nachname: 'Poker',
                vorname: 'Peter',
            },
        ],
        __v: 0,
        createdAt: 0,
        updatedAt: 0,
    },
];
