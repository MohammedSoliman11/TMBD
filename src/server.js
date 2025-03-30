const dotenv = require('dotenv');
const app = require('./app');

dotenv.config();

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
