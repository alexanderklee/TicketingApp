import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete.publisher';
import { natsWrapper } from '../nats-wrapper';

interface Payload {
    orderId: string;
}

// create new bull queue
const expirationQueue = new Queue<Payload>('order:expiration', {
    redis: {
        host: process.env.REDIS_HOST,
    },
});

// job is an object that includes payload in addition to 
// metadata around the job object
expirationQueue.process(async (job) => {
    new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId: job.data.orderId,
    });
});

// export the queue
export { expirationQueue };