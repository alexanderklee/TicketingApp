import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from '@goosenest/common';
import { stripe } from '../stripe';
import { Order } from '../models/order';

const router = express.Router();

router.post(
    '/api/payments',
    requireAuth,
        [
            body('token')
                .not().isEmpty(),
            body('orderId')
                .not().isEmpty()
        ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, orderId } = req.body;

        const order = await Order.findById(orderId);

        // check for invalid order scenarios
        // No order exists, user does not own order, order cancelled
        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }
        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('Order is already cancelled');
        }

        // create Stripe charge request
        // mandatory requirements are currency and amount
        // amount must be in lowest currency unit (for USD its cents)
        await stripe.charges.create({
            currency: 'usd',
            amount: order.price * 100,
            source: token,
        });

        res.status(201).send({ success: true });
    }
);

export { router as createChargeRouter };