import nats from 'node-nats-streaming';

console.clear();

// note: this test requires k8 port-forwarding
// kubectl port-forward <nats-pod-name> 4222:4222
const stan = nats.connect('ticketing','abc', {
    url: 'http://gittix.dev:4222'
});

stan.on('connect', () => {
    console.log('Publisher connected to NATS');

    const data = JSON.stringify({
        id: '123',
        title: 'concert',
        price: 20
    });

    stan.publish('ticket:created', data, () => {
        console.log('Event published');
    });
});