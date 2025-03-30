const User = require('../../models/user.model');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

let user;

describe('User Model', () => {
  it('should create a new user', async () => {
    const userData = {
      username: 'testuser',
      password: 'password123',
    };

    user = await User.create(userData);

    expect(user.username).toBe(userData.username);
    expect(user.email).toBe(userData.email);
    //expect(user.password).not.toBe(userData.password); // Password should be hashed
  });

  it('should hash password before saving', async () => {
    const password = 'password123';

    const user = await User.create({
      username: 'testuser2',
      email: 'test2@example.com',
      password: bcrypt.hashSync(password, 10),
    });

    const isMatch = await bcrypt.compare(password, user.password);
    expect(isMatch).toBe(true);
  });

  it('should find a user by email', async () => {
    const foundUser = await User.findOne({ username: user.username });

    expect(foundUser).toBeTruthy();
    expect(foundUser.username).toBe(user.username);
  });
});
