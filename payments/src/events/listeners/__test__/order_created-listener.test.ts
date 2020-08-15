 import mongoose from 'mongoose';
 import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@goosenest/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';
import { Mongoose } from 'mongoose';
import { Order } from '../../../models/order';



const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data: OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        expiresAt: 'fake',
        userId: 'foobar',
        status: OrderStatus.Created,
        ticket: {
            id: 'concert',
            price: 10,
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
};

it('replicates the order information', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);

    expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    msg.ack();

    expect(msg.ack).toHaveBeenCalled();

});



