// models/Company.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  description: { type: String },
  userId: { type: String },
  category: { type: String },
  pendingValidation: { type: Boolean, default: false }
}, { collection: 'companies' });

module.exports = mongoose.model('Company', companySchema);
