// models/DatabaseEntry.js
const mongoose = require('mongoose');

const databaseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  companyName: { type: String },
  description: { type: String },
  category: { type: String },
  pendingValidation: { type: Boolean, default: false },
  userId: { type: String }
});

module.exports = mongoose.model('DatabaseEntry', databaseSchema);
