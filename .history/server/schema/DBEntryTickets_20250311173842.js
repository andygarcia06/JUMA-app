// models/DBEntryTickets.js
const mongoose = require('mongoose');

const reactionEntrySchema = new mongoose.Schema({
  text: { type: String },
  date: { type: Date }
}, { _id: false });

const dbEntryTicketsSchema = new mongoose.Schema({
  positif: [reactionEntrySchema],
  neutre: [reactionEntrySchema],
  negatif: [reactionEntrySchema]
});

module.exports = mongoose.model('DBEntryTickets', dbEntryTicketsSchema);
