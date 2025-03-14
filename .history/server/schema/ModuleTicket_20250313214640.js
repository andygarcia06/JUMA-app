// models/ModuleTicket.js
const mongoose = require('mongoose');

const moduleTicketSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  ticketId: { type: String },
  userId: { type: String },
  content: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
}, { collection: 'moduletickets' });;

module.exports = mongoose.model('ModuleTicket', moduleTicketSchema);
