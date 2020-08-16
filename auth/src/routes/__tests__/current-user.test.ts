import request from 'supertest'
import { app } from '../../app';

// signin() is a global function declared in test/setup.ts
it('responds with details about the current user', async () => {
    const cookie = await global.signin();

    const response = await request(app)
        .get('/api/users/currentuser')
        .set('Cookie', cookie)
        .send()
        .expect(200);

    //console.log(response.body);
    expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('responds with a null if user is not authenticated', async () => {
    const response = await request(app)
        .get('/api/users/currentuser')
        .send()
        .expect(200);

    expect(response.body.currentUser).toEqual(null);
});