const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  pseudo: { type: String },
  email: { type: String },
  phoneNumber: { type: String },
  role: { type: String, enum: ['utilisateur', 'admin', 'owner'], default: 'utilisateur' },
  programmes: [String],
  courses: [String],
  modificationCount: { type: Number, default: 0 },
  reactionCount: { type: Number, default: 0 },
  upgradeRequested: { type: Boolean, default: false },
  // Champs pour les images
  profilePicUrl: { type: String, default: '/uploads/default-profile.jpg' },
  backgroundPicUrl: { type: String, default: '/uploads/default-background.jpg' },
  // Descriptif de l'utilisateur
  bio: { type: String, default: '' },
  // Adresse postale structurée
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  // Autres informations utiles
  dateOfBirth: { type: Date },
  website: { type: String, default: '' }
}, { collection: 'users', timestamps: true });

module.exports = mongoose.model('User', userSchema);
