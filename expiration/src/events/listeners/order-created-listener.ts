import { Listener, OrderCreatedEvent, Subjects } from '@goosenest/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        console.log('Waiting 10000 (10s) milliseconds to process the job');
        await expirationQueue.add({
            orderId: data.id,
        }, 
        {
            delay: 10000,
        }
    );

        msg.ack();
    }
}