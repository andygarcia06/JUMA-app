// models/Synonymes.js
const mongoose = require('mongoose');

const synonymesSchema = new mongoose.Schema({}, { strict: false }, { collection: 'synonymes' });
module.exports = mongoose.model('Synonymes', synonymesSchema);
