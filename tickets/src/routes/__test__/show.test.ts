import request from 'supertest';
import { app } from '../../app';

it('returns a 404 if the ticket is not found', async () => {
    await request(app)
        .get('/api/tickets/faketicketID')
        .send()
        .expect(404);
});

it('returns the ticket if the ticket is found', async () => {
    const title = 'Erasure';
    const price = 20;

    // insert new ticket into db
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title, price
        })
        .expect(201);
    
    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);
    
    // verify newly inserted ticket is preset
    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
});