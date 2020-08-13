import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});

    expect(response.status).not.toEqual(404);
});

// status code on common/errors/bad-request-error
// common/middleware/current-user and require-auth
// need to validate JWT
it('can only be accessed if the user is signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({})
        .expect(401);
});

// requires authentication prior to running tests
// see setup.ts to see global function routine
it('returns a status other than 401 if user is signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({});

    expect(response.status).not.toEqual(401);
});

// look at common/validate-request
it('returns an error if an invalid title is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: '',
            price: 10,
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            price: 10,
        })
        .expect(400);
});

it('it returns an error if an invalid price is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'Foo Fighters',
            price: -10,
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'Pentatonix',
        })
        .expect(400);
});

it('creates a ticket with valid inputs', async () => {
    // Add in a check to make sure a ticket was created

    // Get all tickets - should be 0 tickets upon init
    // set a test title
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const title = 'Erasure';

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'Erasure',
            price: 20
        })
        .expect(201);

    // verify new ticket was created
    // verify record contains expected title and price
    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].price).toEqual(20);
    expect(tickets[0].title).toEqual(title);
});

it('publishes an event', async () => {
    const title = 'Erasure';

    await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
        title: 'Erasure',
        price: 20
    })
    .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

});


