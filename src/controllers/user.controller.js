const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');

exports.signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return next(new AppError('Username already exists', 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      username,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          username: user.username,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return next(new AppError('Invalid username or password', 401));
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid username or password', 401));
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          username: user.username,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getWatchlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('watchlist');
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.json({
      status: 'success',
      data: {
        watchlist: user.watchlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.removeFromWatchlist = async (req, res, next) => {
  try {
    const { userId, movieId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.watchlist = user.watchlist.filter((id) => !id.equals(movieId));
    await user.save();

    res.json({
      status: 'success',
      message: 'Movie removed from watchlist',
    });
  } catch (error) {
    next(error);
  }
};
