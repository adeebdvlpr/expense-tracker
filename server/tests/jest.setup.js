const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
  process.env.NODE_ENV = 'test';

  // Important: connect mongoose to the in-memory DB
  await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
  // Clean DB between tests
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});
