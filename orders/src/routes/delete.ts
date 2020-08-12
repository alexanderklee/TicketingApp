import express, { Request, Response } from 'express';
import { requireAuth, NotFoundError, NotAuthorizedError } from '@goosenest/common';
import { Order, OrderStatus } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

// In hindisight, this should really be a put or a patch
// method
router.delete(
    '/api/orders/:orderId', 
    requireAuth,
    async (req: Request, res: Response) => {
        const { orderId } = req.params;
        const order = await Order.findById(orderId).populate('ticket');

        if(!order) {
            throw new NotFoundError();
        }

        if(order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        order.status = OrderStatus.Cancelled;
        await order.save();

        // Publish an event stating this even was cancelled!
        new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            ticket: {
                id: order.ticket.id,
            },
        });
        // Using 204 as part of the delete semantics
        res.status(204).send(order);
    }
);

export { router as deleteOrderRouter };