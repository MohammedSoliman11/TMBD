const Movie = require('../models/movie.model');
const User = require('../models/user.model');
const redis = require('../config/redis');
const AppError = require('../utils/AppError');

exports.rateMovie = async (req, res, next) => {
  const { id } = req.params;
  const { rating } = req.body;

  const movie = await Movie.findById(id);
  if (!movie) {
    return next(new AppError('Movie not found', 404));
  }

  movie.averageRating = (movie.averageRating + rating) / 2;
  await movie.save();
  res.json(movie);
};

exports.addToWatchlist = async (req, res, next) => {
  const { userId } = req.body;
  const { id } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError('User not found', 404));
  }
  const movie = await Movie.findById(id);
  if (!movie) {
    return next(new AppError('Movie not found', 404));
  }

  user.watchlist.push(movie);
  await user.save();
  res.json({ message: 'Movie added to watchlist' });
};

exports.getMovies = async (req, res, next) => {
  const { search, genre, page = 1, limit = 10 } = req.query;
  const query = {};
  const cacheKey = `movies:${search || ''}:${
    genre || ''
  }:page${page}:limit${limit}`;

  // Check if data is in Redis cache
  const cachedData = await redis.get(cacheKey);
  if (cachedData) {
    return res.json(JSON.parse(cachedData));
  }

  // Filtering logic
  if (search) query.title = new RegExp(search, 'i');
  if (genre) query.genres = { $in: [genre] };

  // Pagination
  const movies = await Movie.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  if (!movies.length) {
    return next(new AppError('No movies found', 404));
  }

  // Store the result in Redis cache (expires in 1 hour)
  await redis.set(cacheKey, JSON.stringify(movies), 'EX', 3600);

  res.json(movies);
};
