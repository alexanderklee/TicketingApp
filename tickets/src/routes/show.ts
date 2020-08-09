import express, { Request, Response } from 'express';
import { NotFoundError } from '@goosenest/common';
import { Tickets } from '../models/tickets';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
    const ticket = await Tickets.findById(req.params.id);

    if(!ticket) {
        throw new NotFoundError();
    }
    // default is 200
    res.send(ticket);
});

export { router as showTicketRouter };