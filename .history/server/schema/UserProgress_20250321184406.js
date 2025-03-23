// models/UserProgress.js
const mongoose = require('mongoose');

const userProgressModuleSchema = new mongoose.Schema({
  moduleId: { type: String },
  moduleName: { type: String },
  totalCourses: { type: Number },
  validatedCourses: [String],
  progress: { type: String }
}, { _id: false });

const userProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  username: { type: String },
  email: { type: String },
  company: { type: String },
  modules: [userProgressModuleSchema]
}, { collection: 'userprogresses' });

module.exports = mongoose.model('UserProgress', userProgressSchema);
