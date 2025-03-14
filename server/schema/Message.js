// models/TicketMessage.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  messageId: { type: String, required: true },
  userId: { type: String },
  content: { type: String },
  moduleId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
}, { _id: false });

const ticketMessageSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  messages: [messageSchema]
}, { collection: 'ticketmessages' });

module.exports = mongoose.model('TicketMessage', ticketMessageSchema);
