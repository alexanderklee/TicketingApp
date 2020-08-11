import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
    validateRequest,
    NotFoundError,
    requireAuth,
    NotAuthorizedError
} from '@goosenest/common';
import { Tickets } from '../models/tickets';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
    '/api/tickets/:id',
    requireAuth,
    [
        body('title')
            .not()
            .isEmpty()
            .withMessage('Title is required'),
        body('price')
            .isFloat({ gt: 0 })
            .withMessage('Price must be privded and must be greater than 0'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
    const ticket = await Tickets.findById(req.params.id);

    if(!ticket) {
        // throw a 404
        throw new NotFoundError();
    }

    if(ticket.userId !== req.currentUser!.id) {
        // throw a 401
        throw new NotAuthorizedError();
    }

    ticket.set({
        title: req.body.title,
        price: req.body.price,
    });
    // Note: mongodb automatically update ticket with new/changed
    // record
    await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
    });

    res.send(ticket);
}); 

export { router as updateTicketRouter };
