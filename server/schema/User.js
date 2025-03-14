// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pseudo: { type: String },
  email: { type: String },
  phoneNumber: { type: String },
  role: { type: String, enum: ['utilisateur', 'admin', 'owner'], default: 'utilisateur' },
  programmes: [String],
  courses: [String],
  modificationCount: { type: Number, default: 0 },
  reactionCount: { type: Number, default: 0 },
  upgradeRequested: { type: Boolean, default: false }
}, { collection: 'users' });

module.exports = mongoose.model('User', userSchema);