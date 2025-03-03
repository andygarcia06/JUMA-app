const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Identifiant unique de l'utilisateur
  username: { type: String, required: true }, // Nom d'utilisateur
  email: { type: String, required: true }, // Email
  company: { type: String, required: true }, // Entreprise associée à l'utilisateur
  modules: [
    {
      moduleId: String, // ID du module
      moduleName: String, // Nom du module (optionnel pour éviter des requêtes supplémentaires)
      totalCourses: Number, // Nombre total de cours dans ce module
      validatedCourses: [String], // Liste des IDs des cours validés
    }
  ],
});

const UserProgress = mongoose.model
