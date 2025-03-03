const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  company: { type: String, required: true },
  modules: [
    {
      moduleId: String,
      validatedCourses: [String] // Liste des cours validés
    }
  ]
});

const UserProgress = mongoose.model('UserProgress', UserProgressSchema);
module.exports = UserProgress;
