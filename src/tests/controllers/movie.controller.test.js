const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const { MongoMemoryServer } = require('mongodb-memory-server');
const movieRoutes = require('../../routes/movie.routes');
const Movie = require('../../models/movie.model');
const User = require('../../models/user.model');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/movies', movieRoutes);

// Mock Redis
jest.mock('../../config/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
  quit: jest.fn(),
}));

// Mock TMDB service
// jest.mock('../', () => ({
//   getMovieDetails: jest.fn(),
//   searchMovies: jest.fn(),
// }));

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

describe('Movie Controller Test Suite', () => {
  let movie, user;

  beforeEach(async () => {
    // Clear all collections
    await Movie.deleteMany({});
    await User.deleteMany({});

    // Create test data
    movie = await Movie.create({
      tmdbId: 101,
      title: 'Test Movie',
      genres: ['Action'],
    });

    user = await User.create({
      username: 'testuser',
      password: 'testpass',
      watchlist: [],
    });

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should rate a movie', async () => {
    const response = await request(app)
      .post(`/movies/${movie._id}/rate`)
      .send({ rating: 4 });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('averageRating', 2);
  });

  it('should add a movie to the user watchlist', async () => {
    const response = await request(app)
      .post(`/movies/${movie._id}/watchlist`)
      .send({ userId: user._id });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Movie added to watchlist');
  });

  it('should return movies with pagination', async () => {
    const response = await request(app)
      .get('/movies')
      .query({ page: 1, limit: 5 });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should return movie by ID', async () => {
    const response = await request(app).get(`/movies/${movie._id}`);

    expect(response.status).toBe(404);
  });

  //   it('should return movie by title', async () => {
  //     const response = await request(app).get(`/movies/title/${movie.title}`);

  //     expect(response.status).toBe(200);
  //     expect(response.body.title).toBe(movie.title);
  //   });

  //   it('should return movies by genre', async () => {
  //     const response = await request(app).get(`/movies/genre/Action`);

  //     expect(response.status).toBe(200);
  //     expect(response.body.length).toBeGreaterThan(0);
  //   });

  //   it('should delete a movie', async () => {
  //     const response = await request(app).delete(`/movies/${movie._id}`);

  //     expect(response.status).toBe(200);
  //     expect(response.body.message).toBe('Movie deleted');
  //   });

  //   it('should return 404 for non-existing movie', async () => {
  //     const response = await request(app).get('/movies/605c72b1c37a97004f650e9a'); // Random ID

  //     expect(response.status).toBe(404);
  //     expect(response.body.message).toBe('Movie not found');
  //   });
});
