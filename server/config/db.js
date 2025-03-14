// config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://andygarcia:Ansy9362!@cluster0.d0xzm.mongodb.net/jumaDB', {});
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ MongoDB connexion échouée:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
