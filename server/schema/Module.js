// models/Module.js
const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  userId: { type: String },
  reactionType: { type: String },
  reactionStyle: { type: String }
}, { _id: false });

const courseSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  moduleName: { type: String },
  description: { type: String },
  content: { type: String },
  createdAt: { type: Date, default: Date.now },
  creator: {
    pseudo: String,
    userId: String,
    role: String,
    token: String
  },
  reactions: [reactionSchema]
}, { _id: false });

const moduleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  creator: {
    pseudo: String,
    userId: String,
    role: String,
    token: String
  },
  courses: [courseSchema]
}, { collection: 'modules' });

module.exports = mongoose.model('Module', moduleSchema);
