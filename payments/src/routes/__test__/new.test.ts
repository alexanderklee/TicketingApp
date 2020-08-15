import mongoose from 'mongoose';
import request from 'supertest'
import { OrderStatus } from '@goosenest/common';
import { app } from '../../app'
import { Order } from '../../models/order';
import { stripe } from '../../stripe';

// Tell jest to use mocked stripe implementation for
// unit testing purposes
jest.mock('../../stripe');

it('returns a 404 when buying a non-existent order', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'notAtoken',
            orderId: mongoose.Types.ObjectId().toHexString(),
        })
        .expect(404);
});

it('returns a 401 when buying an order that does not belong to user', async () => {
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        status: OrderStatus.Created,
    });
    await order.save();

    await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
        token: 'notAtoken',
        orderId: order.id,
    })
    .expect(401);

});

it('returns a 400 when buying a cancelled order', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        version: 0,
        price: 20,
        status: OrderStatus.Cancelled,
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            orderId: order.id,
            token: 'fake token',
        })
        .expect(400);
});

it('returns a 201 with valid inputs', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        version: 0,
        price: 20,
        status: OrderStatus.Created,
    });
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id,
        })
        .expect(201);
    // verify that stripe was called with the correct charge options
    // [0] : 1st array is the list of calls
    // [0] : 2nd array is the list of options
    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargeOptions.source).toEqual('tok_visa');
    expect(chargeOptions.amount).toEqual(20 * 100);
    expect(chargeOptions.currency).toEqual('usd');

});