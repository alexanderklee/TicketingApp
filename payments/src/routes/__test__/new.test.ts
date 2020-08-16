import mongoose from 'mongoose';
import request from 'supertest'
import { OrderStatus } from '@goosenest/common';
import { app } from '../../app'
import { Order } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

// Tell jest to use mocked stripe implementation for
// unit testing purposes
// Note: if you want to test with the real stripe api then
//       we will need to define env an env var that contains
//       the real api key. This is done in the setup.ts file. 
//       DO NOT USE route handlers to pass charge into to test, 
//       just use stripe API and call list_all_charges to verify
//       our charge request call.

// jest.mock('../../stripe');

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

// test strip using actual strip charge call
it('returns a 201 with valid inputs', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        version: 0,
        price: price,
        status: OrderStatus.Created,
    });
    await order.save();

    // post order data to route hander, which will call the real
    // stripe.charge API
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id,
        })
        .expect(201);

    // call stripe.charges.list to get top 50 charges and find
    // this test's "test call" - this is a bit more realistic
    // for real development situations. 
    // Note: go to stripe website and review charge logs there as well
    const stripeCharges = await stripe.charges.list({ limit: 50 });
    const stripeCharge = stripeCharges.data.find(charge => {
        return charge.amount === price * 100
    });

    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.currency).toEqual('usd');

    // verifying payment model and double verifying the test
    // charge was recorded to our db
    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id,
    });
    // payment var can either be PaymentDoc or NULL (not undef)
    expect(payment).not.toBeNull();
});

// Testing stripe call with MOCKED calls
// Note: Test script testing Strips calls using actual API. 
//       Mock tests will not work in this mode. To test with
//       mocks, change __mocks__/stripe.ts.old to stripe.ts
//       and remove the stripe env var in setup.ts. Lastly
//       comment out above test and uncomment below. 

// it('returns a 201 with valid inputs', async () => {
//     const userId = mongoose.Types.ObjectId().toHexString();

//     const order = Order.build({
//         id: mongoose.Types.ObjectId().toHexString(),
//         userId: userId,
//         version: 0,
//         price: 20,
//         status: OrderStatus.Created,
//     });
//     await order.save();

//     await request(app)
//         .post('/api/payments')
//         .set('Cookie', global.signin(userId))
//         .send({
//             token: 'tok_visa',
//             orderId: order.id,
//         })
//         .expect(201);
//     // verify that stripe was called with the correct charge options
//     // [0] : 1st array is the list of calls
//     // [0] : 2nd array is the list of options
//     const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
//     expect(chargeOptions.source).toEqual('tok_visa');
//     expect(chargeOptions.amount).toEqual(20 * 100);
//     expect(chargeOptions.currency).toEqual('usd');
// });





