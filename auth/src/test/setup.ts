import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';

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