const express = require('express');
const {
  getMovies,
  rateMovie,
  addToWatchlist,
} = require('../controllers/movie.controller');

const router = express.Router();

router.get('/', getMovies);
router.post('/:id/rate', rateMovie);
router.post('/:id/watchlist', addToWatchlist);
// router.get('/:id', getMovieById);

module.exports = router;
