import { Stan } from 'node-nats-streaming';
import { Subjects } from './subjects';

interface Event {
    subject: Subjects;
    data: any;
}

export abstract class Publisher<T extends Event> {
    private client: Stan;
    abstract subject: T['subject'];

    constructor(client: Stan) {
        this.client = client;
    }

    publish(data: T['data']) {
        this.client.publish(this.subject, JSON.stringify(data), () => {
            console.log('Event published.');
        });
    }
}