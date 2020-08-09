import express, { Request, Response } from 'express';
import { Tickets } from '../models/tickets';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
    const tickets = await Tickets.find({});

    res.send(tickets);
});

export { router as indexTicketRouter };
