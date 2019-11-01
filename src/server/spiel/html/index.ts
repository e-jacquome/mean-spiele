import { Request, Response } from 'express';

export const index = (_: Request, res: Response) => {
    //res.render('index', { title: 'Beispiel' });
    console.log('Hey Sweetie');
    res.send('Hallo');
};

export * from './neues-spiel';
export * from './suche';
