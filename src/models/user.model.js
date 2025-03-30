const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

module.exports = mongoose.model('User', UserSchema);
