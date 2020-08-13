import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from '@goosenest/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        // find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);
        // if not ticket is found, throw an error
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        // mark the ticket as being reserved by setting the orderId
        // property
        ticket.set({ orderId: data.id });

        // save the ticket
        await ticket.save();

        // ack the message
        msg.ack();

    }
}