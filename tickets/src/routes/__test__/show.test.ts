import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if the ticket is not found', async () => {
    // Note to self: something is not right with this test. Always
    // returning 404, which is right but the reasons do not seem
    // correct. Will review later when I hit a wall.

    // For this test, we need a valid mongoDB id and not a fake
    // one.
    const id = new mongoose.Types.ObjectId().toHexString();

    const response = await request(app)
        .get(`/api/tickets/${id}`)
        .send()
        .expect(404);
    
    // console.log(response);
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