import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedEvent } from '@goosenest/common';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { JsonWebTokenError } from 'jsonwebtoken';


const setup = async () => {
    // create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // create and save a ticket
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    });

    // create a fake data object
    await ticket.save();
    // create a fake message object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'foo var',
        price: 99,
        userId: 'foobar',
    };

    // create a mock for ack
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    // return data and message
    return { msg, data, ticket, listener };

};

it('finds, udpates and saves a ticket', async () => {
    const { msg, data, ticket, listener } = await setup();

    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);

});

it('acks the message', async() => {
    const { msg, data, ticket, listener } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has an invalid version', async () => {
    const { msg, data, listener, ticket } = await setup();

    data.version = 100;

    try { 
        await listener.onMessage(data, msg);
    } catch (err) {}

    expect(msg.ack).not.toHaveBeenCalled();

})