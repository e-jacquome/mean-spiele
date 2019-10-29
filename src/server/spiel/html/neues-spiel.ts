import { Request, Response } from 'express';

export const neuesSpiel = (_: Request, res: Response) => {
    res.render('neues-spiel', { title: 'Neues Spiel' });
};
