import { Request, Response } from 'express';
import { SpielService } from '../service/spiel.service';

const spielService = new SpielService();

export const suche = async (_: Request, res: Response) => {
    const spiele = await spielService.find();
    res.render('suche', { title: 'Suche', spiele });
};