import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns a 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'Guns and Roses',
            price: 30
        })
        .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        //.set('Cookie', global.signin())
        .send({
            title: 'Guns and Roses',
            price: 30
        })
        .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: "Foo Fighters",
            price: 10
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: "Foo Fighters",
            price: 40
        })
        .expect(401);
});

it('returns a 400 if te user provides an invalid title or price', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: "Foo Fighters",
            price: 10
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 10
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Foo Fighters',
            price: -10
        })
        .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: "Foo Fighters",
            price: 10
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'New Order',
            price: 100
        })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();

    expect(ticketResponse.body.title).toEqual('New Order');
    expect(ticketResponse.body.price).toEqual(100);
});