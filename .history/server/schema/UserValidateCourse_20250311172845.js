// models/UserValidateCourse.js
const mongoose = require('mongoose');

const userValidateCourseSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  validatedCourses: [String]
});

module.exports = mongoose.model('UserValidateCourse', userValidateCourseSchema);
