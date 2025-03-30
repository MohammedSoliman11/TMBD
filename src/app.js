const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const movieRoutes = require('./routes/movie.routes');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

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
