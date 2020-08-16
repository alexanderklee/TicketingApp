import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError } from '@goosenest/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

// Consider using a kubernetes variable or storing this in
// the database and provide a UI to an administrator to adjust
// Note: timer below is measures in seconds and matches the expiration
//       timer as well. 
const EXPIRATION_WINDOW_SECONDS = 30;

// make sure orders post includes a valid order id and
// not some arbitrary string which can pass express-
// validator easily
router.post(
    '/api/orders', 
    requireAuth, 
    [
        body('ticketId')
            .not()
            .isEmpty()
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
            .withMessage('Ticket ID must be provided'),
    ], 
    validateRequest,
    async (req: Request, res: Response) => {
        const { ticketId } = req.body;

        // Find the ticket the user is trying to order in the database
        const ticket = await Ticket.findById(ticketId);

        if(!ticket) {
            throw new NotFoundError();
        }

        // Make sure this ticket is not already reserved
        const isReserved = await ticket.isReserved();

        if(isReserved) {
            throw new BadRequestError('Ticket is already reserved');
        }

        // Calculate an expiration date for this order (expiresAt)
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
        
        // Build the order and save it to database
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket: ticket,
        });

        await order.save();

        // Publish an event that an order was created
        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),
            ticket: {
                id: ticket.id,
                price: ticket.price,
            },
        });

        res.status(201).send(order);
    }
);

export { router as newOrderRouter };