const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Movie = require('../../models/movie.model'); // Adjust path based on your project structure

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('Movie Model Test Suite', () => {
  it('should create a movie successfully', async () => {
    const movieData = {
      tmdbId: 12345,
      title: 'Test Movie',
      genres: ['Action', 'Adventure'],
    };

    const movie = new Movie(movieData);
    const savedMovie = await movie.save();

    expect(savedMovie._id).toBeDefined();
    expect(savedMovie.tmdbId).toBe(movieData.tmdbId);
    expect(savedMovie.title).toBe(movieData.title);
    expect(savedMovie.genres).toEqual(expect.arrayContaining(movieData.genres));
    expect(savedMovie.averageRating).toBe(0);
    expect(savedMovie.watchlistUsers).toEqual([]);
  });

  it('should fail to create a movie without a required field', async () => {
    const movieData = {
      genres: ['Comedy'],
    };

    try {
      const movie = new Movie(movieData);
      await movie.save();
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.tmdbId).toBeDefined();
      expect(error.errors.title).toBeDefined();
    }
  });

  it('should enforce unique tmdbId', async () => {
    const movieData1 = { tmdbId: 1111, title: 'Movie One', genres: ['Sci-Fi'] };
    const movieData2 = { tmdbId: 1111, title: 'Movie Two', genres: ['Drama'] };

    await new Movie(movieData1).save();

    await expect(new Movie(movieData2).save()).rejects.toThrow();
  });

  it('should allow adding users to watchlist', async () => {
    const userId = new mongoose.Types.ObjectId();
    const movie = new Movie({
      tmdbId: 54321,
      title: 'Watchlist Movie',
      genres: ['Thriller'],
      watchlistUsers: [userId],
    });

    const savedMovie = await movie.save();
    expect(savedMovie.watchlistUsers.length).toBe(1);
    expect(savedMovie.watchlistUsers[0]).toEqual(userId);
  });
});
