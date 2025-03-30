const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const movieRoutes = require('./routes/movie.routes');
const userRoutes = require('./routes/user.routes');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 'error',
    message:
      'Too many requests from this IP, please try again after 15 minutes',
  },
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Apply rate limiting to all routes
app.use(limiter);

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('TMDB Express API is running...');
});

// defualt route
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

module.exports = app;
