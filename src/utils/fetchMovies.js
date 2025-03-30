const axios = require('axios');
const Movie = require('../models/movie.model');
const redis = require('../config/redis');
require('dotenv').config();

const TMDB_API_URL = process.env.TMDB_API_URL;
const API_KEY = process.env.TMDB_API_KEY;

const CACHE_KEY = 'tmdb:movies';
const CACHE_DURATION = 60 * 60; // 1 hour in seconds
const TOTAL_PAGES = 100;
const DELAY_BETWEEN_REQUESTS = 250; // 250ms delay between requests to respect rate limits
const BATCH_SIZE = 100; // Number of movies to process in each batch

// Helper function to delay execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchMoviesFromPage = async (page) => {
  try {
    const { data } = await axios.get(TMDB_API_URL, {
      params: { page },
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    return data.results;
  } catch (err) {
    console.error(`Error fetching page ${page}:`, err.message);
    return [];
  }
};

// Helper function to process movies in batches
const processMoviesBatch = async (movies) => {
  try {
    // Get existing movie IDs in bulk
    const existingMovies = await Movie.find(
      { tmdbId: { $in: movies.map((m) => m.tmdbId) } },
      { tmdbId: 1 }
    );
    const existingIds = new Set(existingMovies.map((m) => m.tmdbId));

    // Filter out existing movies
    const newMovies = movies.filter((movie) => !existingIds.has(movie.tmdbId));

    if (newMovies.length > 0) {
      // Use bulk insert for new movies
      await Movie.insertMany(newMovies, {
        ordered: false, // Continue on error
        lean: true, // Faster insertion
      });
      console.log(`Inserted ${newMovies.length} new movies`);
    }

    return {
      total: movies.length,
      new: newMovies.length,
      existing: movies.length - newMovies.length,
    };
  } catch (err) {
    console.error('Error processing movies batch:', err.message);
    return {
      total: movies.length,
      new: 0,
      existing: 0,
      error: err.message,
    };
  }
};

const fetchMovies = async () => {
  try {
    // Try to get data from Redis cache
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
      console.log('Using cached TMDB data from Redis');
      return JSON.parse(cachedData);
    }

    console.log('Starting to fetch movies from TMDB...');
    const allMovies = [];
    let totalMovies = 0;
    let processedStats = {
      total: 0,
      new: 0,
      existing: 0,
      errors: 0,
    };

    // Fetch movies from all pages
    for (let page = 1; page <= TOTAL_PAGES; page++) {
      console.log(`Fetching page ${page}/${TOTAL_PAGES}`);
      const movies = await fetchMoviesFromPage(page);

      if (movies.length === 0) {
        console.log(`No more movies found after page ${page - 1}`);
        break;
      }

      allMovies.push(...movies);
      totalMovies += movies.length;

      // Process movies in batches
      if (allMovies.length >= BATCH_SIZE) {
        const moviesToProcess = allMovies
          .splice(0, BATCH_SIZE)
          .map((movie) => ({
            tmdbId: movie.id,
            title: movie.title,
            genres: movie.genre_ids,
          }));

        const batchStats = await processMoviesBatch(moviesToProcess);
        processedStats.total += batchStats.total;
        processedStats.new += batchStats.new;
        processedStats.existing += batchStats.existing;
        if (batchStats.error) processedStats.errors++;
      }

      // Add delay between requests to respect rate limits
      if (page < TOTAL_PAGES) {
        await delay(DELAY_BETWEEN_REQUESTS);
      }
    }

    // Process remaining movies
    if (allMovies.length > 0) {
      const moviesToProcess = allMovies.map((movie) => ({
        tmdbId: movie.id,
        title: movie.title,
        genres: movie.genre_ids,
      }));

      const batchStats = await processMoviesBatch(moviesToProcess);
      processedStats.total += batchStats.total;
      processedStats.new += batchStats.new;
      processedStats.existing += batchStats.existing;
      if (batchStats.error) processedStats.errors++;
    }

    // Store data in Redis cache
    await redis.setex(
      CACHE_KEY,
      CACHE_DURATION,
      JSON.stringify({ results: allMovies })
    );

    console.log('Sync completed with the following stats:');
    console.log(`- Total movies processed: ${processedStats.total}`);
    console.log(`- New movies inserted: ${processedStats.new}`);
    console.log(`- Existing movies skipped: ${processedStats.existing}`);
    console.log(`- Errors encountered: ${processedStats.errors}`);

    return { results: allMovies };
  } catch (err) {
    console.error('Error syncing movies:', err.message);
    throw err;
  }
};

module.exports = fetchMovies;
