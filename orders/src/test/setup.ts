import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Need to declare signin as a global var to TS
declare global {
    namespace NodeJS {
        interface Global {
            signin(): string[];
        }
    }
}

// Make sure test scripts uses the mock nats-wrapper 
// and not the real nats-wrapper
jest.mock('../nats-wrapper');

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
    // For testing purposes, clear jests counters for mock
    // libraries
    jest.clearAllMocks();
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
global.signin = () => {
    // Build a JWT payload { id, email, iat }
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    };

    // Create the JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build session object {jwt: MY_JWT }
    const session = { jwt: token };

    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    // Take JSON and encode as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // Return a string that the cookie with encoded data 
    return [`express:sess=${base64}`];

};