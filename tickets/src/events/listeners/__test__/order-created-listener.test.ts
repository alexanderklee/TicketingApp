import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@goosenest/common';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    // create a listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 99,
        userId: 'foobar',
    });

    await ticket.save();

    // create fake data event
    const data: OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'foobar',
        expiresAt: 'fake',
        ticket: {
            id: ticket.id,
            price: ticket.price,
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    }

    return { listener, ticket, data, msg };
};

it('sets the userId of the ticket', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    console.log(updatedTicket);
    console.log(data);

    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('calls the ack message', async () => {

});