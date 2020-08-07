import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

// Need to declare signin as a global var to TS
declare global {
    namespace NodeJS {
        interface Global {
            signin(): Promise<string[]>
        }
    }
}

let mongo: any;
// adding before hook to start mongo and
// get mongo URI and connect mongoose to it
beforeAll(async () => {
    process.env.JWT_KEY = 'asdfasdf';
    
    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

// adding hook to delete any existing recods in 
// mongo
beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

// Creating a global function for convenience to avoid
// repetitive cut/pasting in test - yes I'm lazy
global.signin = async () => {
    const email = 'test@test.com';
    const password = 'password';

    const response = await request(app)
        .post('/api/users/signup')
        .send ({
            email, password
        })
        .expect(201);
    
    const cookie = response.get('Set-Cookie');
    return cookie;
}