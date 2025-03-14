// models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user: {
    userId: String
    // D'autres informations d'utilisateur si nécessaire
  },
  detail: { type: String },
  type: { type: String },
  comments: { type: String },
  rule: { type: String },
  ticketNumber: { type: String },
  title: { type: String },
  organization: { type: String },
  request: { type: String },
  assigned: [String],
  subscribers: [String],
  markers: { type: String },
  priority: { type: String },
  creationDate: { type: Date },
  userId: { type: String },
  programName: { type: String },
  programId: { type: String },
  selectedModule: { type: String },
  pendingValidationTicket: { type: String },
  meteo: { type: String },
  validatedAt: { type: Date }
}, { collection: 'tickets' });

module.exports = mongoose.model('Ticket', ticketSchema);
