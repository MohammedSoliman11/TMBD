require('dotenv').config();
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock Redis
jest.mock('../config/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
  quit: jest.fn(),
}));

// Set test environment variables
process.env.NODE_ENV = 'test';

// Increase timeout for all tests
jest.setTimeout(30000);

let mongod;

// // Connect to the in-memory database
// module.exports.connect = async () => {
//   mongod = await MongoMemoryServer.create();
//   const uri = mongod.getUri();
//   await mongoose.connect(uri);
// };

// // Close database connection
// module.exports.closeDatabase = async () => {
//   await mongoose.connection.dropDatabase();
//   await mongoose.connection.close();
//   await mongod.stop();
// };

// // Clear database
// module.exports.clearDatabase = async () => {
//   const collections = mongoose.connection.collections;
//   for (const key in collections) {
//     const collection = collections[key];
//     await collection.deleteMany();
//   }
// };

// // Connect to MongoDB before all tests
// beforeAll(async () => {
//   await module.exports.connect();
// });

// // Clear database and close connection after all tests
// afterAll(async () => {
//   await module.exports.closeDatabase();
// });

// // Clear database before each test
// beforeEach(async () => {
//   await module.exports.clearDatabase();
//   jest.clearAllMocks();
// });
