const dotenv = require('dotenv');
const connectDB = require('./config/db');
const fetchMovies = require('./utils/fetchMovies');
const app = require('./app');

dotenv.config();

// Connect to database
connectDB();

// Sync TMDB data when the app starts
fetchMovies();

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
