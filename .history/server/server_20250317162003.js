const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const fsAsync= require('fs/promises');
const path = require('path');
const jwt = require('jsonwebtoken');
const router = express.Router();
const http = require('http');
const WebSocket = require('ws');
const natural = require("natural"); // Pour comparer les textes
require('dotenv').config(); // Charger les variables d'environnement
const mongoose = require('mongoose');


// Importation de vos modèles existants
const User = require('./schema/User');
const Company = require('./schema/Company');
const ProjectManagement = require('./schema/ProjectManagement');
const Ticket = require('./schema/Ticket');
// const TicketData = require('./schema/TicketData');
const UserValidateCourse = require('./schema/UserValidateCourse');
const DatabaseModel = require('./schema/Database'); // Par exemple
const UserProgress = require('./schema/UserProgress');
const Message = require('./schema/Message');


const ModuleTicket = require('./schema/ModuleTicket');
const Module = require('./schema/Module');
const Synonym = require('./schema/Synonym');
const DBEntryTickets = require('./schema/DBEntryTickets');
const DataCompanies = require('./schema/DataCompanies');



const app = express();
const port = process.env.PORT || 3001;

const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://juma-v2-caed179afac0.herokuapp.com',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// Connexion MongoDB
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://andygarcia:Ansy9362!@cluster0.d0xzm.mongodb.net/Jumadb');
    console.log('✅ MongoDB connecté');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📂 Collections disponibles dans la DB :');
    collections.forEach(collection => console.log('-', collection.name));

  } catch (error) {
    console.error('❌ MongoDB connexion échouée :', error);
    process.exit(1);
  }
};

connectDB();


app.get('/version', (req, res) => {
  res.json({ version: 'v40', commit: '6c3ab0cc' });
});


const user = { id: 123, username: 'utilisateur' };
const token = jwt.sign(user, 'votreCléSecrète');


console.log(`✅ Serveur backend démarré sur le port ${port}`);

app.use(bodyParser.json());


// Route de bienvenue
app.get('/', (req, res) => {
  res.send('Bienvenue sur le serveur Node.js !');
});



// Route de connexion
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('[DEBUG] Login demandé pour:', username, password);

  try {
    const users = await User.find({});
    console.log(req.url, req.body);
    console.log("[DEBUG] Liste complète des utilisateurs:", users);

    // 🔍 Trouver l'utilisateur par son username
    const user = await User.findOne({ username });
    console.log("[DEBUG] Utilisateur trouvé avec username:", user);

    if (!user) {
      console.log('[DEBUG] Aucun utilisateur avec ce username:', username);
      return res.status(401).json({ success: false, message: 'Utilisateur introuvable' });
    }

    if (user.password !== password) {
      console.log('[DEBUG] Mot de passe incorrect pour:', username);
      return res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
    }

    // 🔐 Génération du token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secretKey',
      { expiresIn: '1h' }
    );

    // ✅ Envoi de toutes les infos attendues par le front
    res.json({
      success: true,
      message: 'Connexion réussie',
      userId: user._id,  // Ajouté
      pseudo: user.pseudo,  // Ajouté
      email: user.email,  // Ajouté
      role: user.role,
      token
    });

  } catch (err) {
    console.error('[DEBUG] Erreur interne:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur interne' });
  }
});




app.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Identifiants reçus - Username:', username, 'Password:', password);

  try {
    const user = await User.findOne({ username, password, role: 'admin' });

    if (user) {
      const token = jwt.sign({ id: user._id, username: user.username, role: 'admin' }, process.env.JWT_SECRET || 'votreCléSecrète', { expiresIn: '1h' });

      res.json({
        success: true,
        message: 'Connexion admin réussie',
        pseudo: user.pseudo,
        userId: user.username,
        role: 'admin',
        token: token
      });
    } else {
      res.status(401).json({ success: false, error: 'Identifiants admin incorrects' });
    }

  } catch (err) {
    res.status(500).json({ success: false, error: 'Erreur serveur interne' });
  }
});


// Route de SignUp avec attribution de rôle
app.post('/signup', async (req, res) => {
  const { username, password, pseudo, email, phoneNumber, role } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Nom d\'utilisateur déjà utilisé' });
    }

    const newUser = new User({ username, password, pseudo, email, phoneNumber, role });
    await newUser.save();

    res.json({ success: true, message: 'Inscription réussie' });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur interne' });
  }
});


// Middleware pour vérifier le token JWT et ajouter l'utilisateur à la requête
function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];

  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];

    jwt.verify(bearerToken, process.env.JWT_SECRET || 'votreCléSecrète', (err, authData) => {
      if (err) {
        return res.sendStatus(403); // Accès refusé si erreur du token
      }
      
      req.user = authData;
      next(); // Token valide, passage à la route suivante
    });

  } else {
    res.sendStatus(401); // Token absent
  }
}


// Upgrade user
app.post('/upgrade-request', async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // Marquer que l'utilisateur a demandé un upgrade
    user.upgradeRequested = true;
    await user.save();

    res.json({ success: true, message: 'Demande d\'upgrade enregistrée' });

  } catch (err) {
    console.error('Erreur lors de la demande d\'upgrade :', err);
    res.status(500).json({ success: false, message: 'Erreur serveur interne' });
  }
});




/**
 * POST /upgrade-request
 * Reçoit { username } dans le body et met à jour l'enregistrement correspondant en ajoutant "upgradeRequested": true.
 * Pour trouver l'utilisateur, on compare soit sur "username" soit sur "userId".
 */
app.post('/upgrade-request', async (req, res) => {
  const { username } = req.body;
  console.log('[SERVER] Identifiant reçu - Username:', username);

  try {
    const user = await User.findOne({ username });

    if (!user) {
      console.log('[SERVER] Utilisateur non trouvé pour username:', username);
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }

    console.log('[SERVER] Utilisateur avant mise à jour:', user);

    // Marquer que l'utilisateur a demandé un upgrade
    user.upgradeRequested = true;
    await user.save();

    console.log('[SERVER] Utilisateur après mise à jour:', user);

    res.json({ success: true, message: 'Demande d\'upgrade enregistrée', updatedUser: user });

  } catch (err) {
    console.error('[SERVER] Erreur lors de la mise à jour utilisateur:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur interne' });
  }
});

/**
 * GET /upgrade-requests
 * Renvoie la liste des utilisateurs dont "upgradeRequested" est true et dont le rôle est "utilisateur".
 * Seuls les enregistrements possédant soit "username" soit "userId" sont pris en compte.
 */
app.get('/upgrade-requests', async (req, res) => {
  try {
    const users = await User.find({});
    console.log("[SERVER] Tous les utilisateurs:", users);

    const upgradeRequests = users.filter(u => 
      (u.username || u.userId) && u.upgradeRequested === true && u.role === 'utilisateur'
    );
    console.log("[SERVER] Demandes d'upgrade filtrées:", upgradeRequests);

    res.json({ success: true, requests: upgradeRequests });
  } catch (err) {
    console.error('[SERVER] Erreur lors de la récupération des demandes d\'upgrade :', err);
    res.status(500).json({ success: false, error: 'Erreur serveur interne' });
  }
});

/**
 * PUT /update-role
 * Reçoit { username, newRole } dans le body et met à jour l'utilisateur correspondant en modifiant son rôle
 * et en réinitialisant le flag "upgradeRequested". La recherche se fait sur "username" ou "userId".
 */
app.put('/update-role', async (req, res) => {
  const { username, newRole } = req.body;
  console.log("[SERVER] Mise à jour du rôle demandée pour username/userId:", username, "avec nouveau rôle:", newRole);

  try {
    const user = await User.findOne({ $or: [{ username }, { userId: username }] });

    if (!user) {
      console.log("[SERVER] Utilisateur non trouvé pour username/userId:", username);
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }

    user.role = newRole;
    user.upgradeRequested = false;
    await user.save();

    console.log("[SERVER] Utilisateur après mise à jour:", user);

    res.json({ success: true, message: 'Rôle mis à jour', updatedUser: user });
  } catch (err) {
    console.error('[SERVER] Erreur lors de la mise à jour du rôle utilisateur :', err);
    res.status(500).json({ success: false, error: 'Erreur serveur interne' });
  }
});



// Owner connection


// Route pour la connexion d'un utilisateur owner
app.post('/owner-login', async (req, res) => {
  const { username, password } = req.body;
  console.log("[SERVER] Tentative de connexion owner pour:", username);

  try {
    const user = await User.findOne({ username, password, role: 'owner' });

    if (!user) {
      console.log("[SERVER] Échec de la connexion owner pour:", username);
      return res.status(401).json({ success: false, error: "Identifiants incorrects ou vous n'êtes pas owner" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'votreCléSecrète', { expiresIn: '1h' });

    res.json({
      success: true,
      message: 'Connexion owner réussie',
      pseudo: user.pseudo,
      userId: user.username,
      role: user.role,
      token
    });
  } catch (err) {
    console.error('[SERVER] Erreur lors de la connexion owner :', err);
    res.status(500).json({ success: false, error: 'Erreur serveur interne' });
  }
});

// Routes pour les tickets...


// Route pour récupérer tous les utilisateurs
app.get('/api/get-users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.error('[SERVER] Erreur lors de la récupération des utilisateurs:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur interne' });
  }
});





// KNOWLEDGE MANAGEMENT


// Endpoint pour récupérer tous les modules depuis MongoDB
app.get('/api/modules', async (req, res) => {
  try {
    const modules = await Module.find({});
    console.log('[SERVER] Modules récupérés avec succès :', modules);
    res.json(modules);
  } catch (err) {
    console.error('[SERVER] Erreur lors de la récupération des modules :', err);
    res.status(500).json({ success: false, error: 'Erreur serveur interne' });
  }
});


// Endpoint pour récupérer les cours d'un module précis via MongoDB
app.get('/api/modules/:moduleId/courses', async (req, res) => {
  const { moduleId } = req.params;

  try {
    const module = await Module.findOne({ id: moduleId });

    if (!module) {
      console.log(`[SERVER] Aucun module trouvé avec l'id : ${moduleId}`);
      return res.status(404).json({ success: false, message: 'Module non trouvé.' });
    }

    console.log(`[SERVER] Cours du module ${moduleId} récupérés avec succès :`, module.courses);
    res.json(module.courses);
  } catch (error) {
    console.error(`[SERVER] Erreur lors de la récupération des cours du module ${moduleId} :`, error);
    res.status(500).json({ success: false, error: 'Erreur serveur interne' });
  }
});



// Endpoint pour créer un nouveau module
app.post('/api/modules', async (req, res) => {
  console.log('Requête POST /api/modules reçue');

  const { title, createdAt, creator } = req.body;
  if (!title || !createdAt || !creator) {
    return res.status(400).json({ message: 'Veuillez fournir un titre, une date de création et un créateur.' });
  }

  try {
    const newModule = new Module({
      id: new mongoose.Types.ObjectId().toString(),
      title,
      createdAt,
      creator,
      courses: []
    });
    await newModule.save();
    res.status(201).json(newModule);
  } catch (err) {
    console.error("[SERVER] Erreur lors de la création du module:", err);
    res.status(500).json({ success: false, error: 'Erreur serveur interne' });
  }
});

// Endpoint pour créer un nouveau cours dans un module
app.post('/api/courses', async (req, res) => {
  console.log('Requête POST /api/courses reçue');

  const { title, moduleName, description, content, createdAt, creator } = req.body;
  if (!title || !moduleName || !description || !content || !createdAt || !creator) {
    return res.status(400).json({ message: 'Veuillez fournir toutes les informations requises.' });
  }

  try {
    const module = await Module.findOne({ title: moduleName });
    if (!module) {
      return res.status(404).json({ message: 'Module non trouvé' });
    }

    const existingCourse = module.courses.find(course => course.title === title);
    if (existingCourse) {
      return res.status(400).json({ message: 'Un cours avec ce titre existe déjà dans ce module' });
    }

    const newCourse = {
      id: new mongoose.Types.ObjectId().toString(),
      title,
      moduleName: module.title,
      description,
      content,
      createdAt: new Date(),
      creator
    };

    module.courses.push(newCourse);
    await module.save();
    res.status(201).json(newCourse);
  } catch (err) {
    console.error("[SERVER] Erreur lors de la création du cours:", err);
    res.status(500).json({ success: false, error: 'Erreur serveur interne' });
  }
});

app.post('/api/log-course-view', async (req, res) => {
  const { courseId, userId } = req.body;

  if (!courseId || !userId) {
    return res.status(400).json({ message: 'CourseId et UserId sont requis.' });
  }

  try {
    const user = await User.findOne({ username: userId });
    if (!user) {
      return res.status(404).json({ message: `L'utilisateur ${userId} n'a pas été trouvé.` });
    }

    if (!user.courses) {
      user.courses = [];
    }

    if (!user.courses.includes(courseId)) {
      user.courses.push(courseId);
      await user.save();
      return res.json({ message: `Identifiant du cours consulté ajouté avec succès à l'utilisateur ${userId}.` });
    } else {
      return res.status(400).json({ message: `L'utilisateur ${userId} a déjà consulté ce cours.` });
    }
  } catch (err) {
    console.error("[SERVER] Erreur lors de la mise à jour des cours consultés:", err);
    res.status(500).json({ success: false, error: 'Erreur serveur interne' });
  }
});

// ROutes pour récupéré les courses validés
app.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ username: userId });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    console.log("Informations de l'utilisateur :", user);
    res.status(200).json(user);
  } catch (error) {
    console.error('[SERVER] Erreur lors de la récupération de l\'utilisateur :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// Route pour récupérer les cours validés d'un utilisateur et calculer la progression
app.get('/api/users/:userId/progression', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ username: userId });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    const userValidateEntry = await UserValidateCourse.findOne({ userId });
    const totalCourses = user.courses.length;
    const validatedModules = userValidateEntry ? userValidateEntry.validatedCourses : [];
    const validatedCourseCount = validatedModules.length;
    const progressPercentage = totalCourses > 0 ? (validatedCourseCount / totalCourses) * 100 : 0;

    res.status(200).json({
      progress: progressPercentage,
      validatedCourses: validatedModules,
      totalCourses: totalCourses,
      validatedCount: validatedCourseCount
    });
  } catch (error) {
    console.error('[SERVER] Erreur lors de la récupération de la progression :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// Route pour mettre à jour le nombre de modifications de l'utilisateur
app.post('/api/user/:userId/update-modification-count', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ username: userId });
    if (!user) {
      return res.status(404).json({ message: `Utilisateur ${userId} non trouvé.` });
    }

    user.modificationCount = (user.modificationCount || 0) + 1;
    await user.save();

    console.log(`Nombre de modifications mis à jour pour ${userId} : ${user.modificationCount}`);
    res.status(200).json({ message: 'Nombre de modifications mis à jour avec succès', modificationCount: user.modificationCount });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la mise à jour du nombre de modifications :", error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour du nombre de modifications' });
  }
});

// Route pour un ajouté les cours validé au user

const JSON_FILE_PATH = path.join(__dirname, 'json', 'connectDatas.json'); // Chemin vers le fichier JSON

// Route pour la validation d'un cours
app.post('/validated-course', async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({ message: 'UserId et CourseId sont requis.' });
    }

    const user = await User.findOne({ username: userId });
    if (!user) {
      return res.status(404).json({ message: `Utilisateur ${userId} non trouvé.` });
    }

    if (!user.validatedCourses) {
      user.validatedCourses = [];
    }

    if (user.validatedCourses.includes(courseId)) {
      return res.status(400).json({ message: 'Ce cours a déjà été validé.' });
    }

    user.validatedCourses.push(courseId);
    await user.save();

    res.status(200).json({ message: 'Cours validé avec succès.' });
  } catch (error) {
    console.error('[SERVER] Erreur lors de la validation du cours :', error);
    res.status(500).json({ message: 'Une erreur est survenue lors de la validation du cours.' });
  }
});


// Route pour mettre à jour le nombre de réactions de l'utilisateur
app.post('/api/user/:userId/update-reaction-count', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ username: userId });
    if (!user) {
      return res.status(404).json({ message: `Utilisateur ${userId} non trouvé.` });
    }

    user.reactionCount = (user.reactionCount || 0) + 1;
    await user.save();

    console.log(`Nombre de réactions mis à jour pour ${userId} : ${user.reactionCount}`);
    res.status(200).json({ message: 'Nombre de réactions mis à jour avec succès', reactionCount: user.reactionCount });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la mise à jour du nombre de réactions :", error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour du nombre de réactions' });
  }
});






// Charger les données des modules à partir du fichier JSON
const modulesData = require(path.join(__dirname, 'json', 'modules.json'));

// Route pour mettre à jour le contenu d'un cours
app.put('/courses/:courseId', async (req, res) => {
  const { courseId } = req.params;
  const { content } = req.body;

  try {
    const module = await Module.findOne({ 'courses.id': courseId });
    if (!module) {
      return res.status(404).json({ error: "Le cours avec l'ID spécifié n'a pas été trouvé." });
    }

    const course = module.courses.find(course => course.id === courseId);
    if (!course) {
      return res.status(404).json({ error: "Le cours avec l'ID spécifié n'a pas été trouvé." });
    }

    course.content = content;
    await module.save();

    console.log('Le contenu du cours a été mis à jour avec succès.');
    res.json({ message: 'Le contenu du cours a été mis à jour avec succès.' });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la mise à jour du contenu du cours :", error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du contenu du cours.' });
  }
});



// Supposons que vous ayez également une variable "modules" (par exemple chargée de la même manière)
// pour la deuxième route. Réécrivons-la en utilisant le même chemin absolu :
app.put('/api/modules/:moduleId/courses/:courseId', async (req, res) => {
  const { moduleId, courseId } = req.params;
  const { content } = req.body;

  try {
    const module = await Module.findOne({ id: moduleId });
    if (!module) {
      console.error("Module not found");
      return res.status(404).json({ message: 'Module not found' });
    }

    const course = module.courses.find(course => course.id === courseId);
    if (!course) {
      console.error("Course not found");
      return res.status(404).json({ message: 'Course not found' });
    }

    course.content = content;
    await module.save();

    console.log("Data successfully updated");
    res.json(course);
  } catch (error) {
    console.error("[SERVER] Error updating course content:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Fonction pour générer un ID unique
function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// Route POST pour mettre à jour le nombre de réactions de l'utilisateur


// Route pour récupérer les réactions d'un cours spécifique
app.get('/api/modules/:moduleId/courses/:courseId/reactions', (req, res) => {
  try {
    const { moduleId, courseId } = req.params;

    // Charger les données depuis le fichier JSON
    const modulesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'json', 'modules.json'), 'utf-8'));

    // Trouver le module et le cours correspondants dans les données chargées
    const module = modulesData.find(module => module.id === moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module non trouvé' });
    }

    const course = module.courses.find(course => course.id === courseId);
    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé dans le module' });
    }

    // Récupérer toutes les réactions du cours spécifié
    const reactions = course.reactions;

    // Ensuite, renvoyer les réactions sous forme de réponse JSON
    res.json(reactions);
  } catch (error) {
    console.error('Erreur lors de la récupération des réactions :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des réactions' });
  }
});

// Route pour ajouter une nouvelle réaction à un cours
app.get('/api/user/:userId/module-and-ticket-count', (req, res) => {
  const { userId } = req.params;

  // Définitions des chemins vers les fichiers JSON
  const modulesFilePath = path.join(__dirname, 'json', 'modules.json');
  const ticketsFilePath = path.join(__dirname, 'json', 'moduleTickets.json');

  try {
    // Charger les données depuis les fichiers JSON
    const modulesData = fs.existsSync(modulesFilePath) ? JSON.parse(fs.readFileSync(modulesFilePath, 'utf8')) : [];
    const ticketsData = fs.existsSync(ticketsFilePath) ? JSON.parse(fs.readFileSync(ticketsFilePath, 'utf8')) : [];

    // Filtrer les modules et tickets pour ceux créés par l'utilisateur
    const userModulesCount = modulesData.filter(module => module.creator.userId === userId).length;
    const userTicketsCount = ticketsData.filter(ticket => ticket.userId === userId).length;

    // Total des entrées
    const totalEntries = userModulesCount + userTicketsCount;

    res.json({ totalEntries, userModulesCount, userTicketsCount });
  } catch (error) {
    console.error('Erreur lors de la récupération des données :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des données.' });
  }
});

// Route pour mettre à jour une réaction dans un cours
app.put('/api/modules/:moduleId/courses/:courseId/reactions', async (req, res) => {
  try {
    const { moduleId, courseId } = req.params;
    const { userId, reactionType, reactionStyle } = req.body;

    const module = await Module.findOne({ id: moduleId });
    if (!module) {
      return res.status(404).json({ message: 'Module non trouvé' });
    }

    const course = module.courses.find(course => course.id === courseId);
    if (!course) {
      return res.status(404).json({ message: 'Cours non trouvé dans le module' });
    }

    const reactionIndex = course.reactions.findIndex(reaction => reaction.userId === userId);
    if (reactionIndex !== -1) {
      // Si la réaction existe déjà, mettre à jour les valeurs
      course.reactions[reactionIndex].reactionType = reactionType;
      course.reactions[reactionIndex].reactionStyle = reactionStyle;
      console.log(`Réaction mise à jour pour l'utilisateur ${userId}: ${reactionType} (${reactionStyle})`);
    } else {
      // Ajouter une nouvelle réaction
      course.reactions.push({ userId, reactionType, reactionStyle });
      console.log(`Nouvelle réaction ajoutée pour l'utilisateur ${userId}: ${reactionType} (${reactionStyle})`);
    }

    await module.save();
    res.json({ message: 'Réaction mise à jour avec succès' });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la mise à jour de la réaction :", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la réaction" });
  }
});
// REWARD

// Route pour récupérer le nombre total d'entrées de modules et de tickets créés par un utilisateur
app.get('/api/user/:userId/module-and-ticket-count', async (req, res) => {
  try {
    const { userId } = req.params;

    // Compter les modules créés par l'utilisateur
    const userModulesCount = await Module.countDocuments({ 'creator.userId': userId });

    // Compter les tickets créés par l'utilisateur
    const userTicketsCount = await ModuleTicket.countDocuments({ userId });

    // Calcul du total
    const totalEntries = userModulesCount + userTicketsCount;

    res.json({ totalEntries, userModulesCount, userTicketsCount });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des données :", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des données." });
  }
});


app.get('/api/users/:userId/progression', async (req, res) => {
  try {
    const { userId } = req.params;

    // Trouver l'utilisateur et ses cours
    const user = await User.findOne({ username: userId });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const totalCourses = user.courses ? user.courses.length : 0;

    // Trouver les modules validés de l'utilisateur
    const userValidatedModules = await UserValidateCourse.findOne({ userId });
    const validatedCount = userValidatedModules ? userValidatedModules.validatedCourses.length : 0;

    // Total des entrées (cours + modules validés)
    const totalEntries = totalCourses + validatedCount;

    // Calcul de la progression basée sur un objectif de 6 entrées
    const progress = (totalEntries / 6) * 100;

    res.json({
      totalCourses,
      validatedCount,
      totalEntries,
      progress: Math.min(progress, 100), // Limiter à 100% de progression
    });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération de la progression :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


app.get('/modules/creator/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Trouver les modules créés par l'utilisateur spécifié
    const userModules = await Module.find({ 'creator.userId': userId });

    res.json(userModules);
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des modules :", error);
    res.status(500).json({ message: "Une erreur s'est produite lors du traitement des données des modules." });
  }
});

app.get('/api/messages/:messageId/modules', async (req, res) => {
  try {
    const { messageId } = req.params;

    // Rechercher le message correspondant dans la base de données
    const messageFound = await Message.findOne({ "messages.messageId": messageId }, { "messages.$": 1 });

    if (!messageFound) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    res.status(200).json(messageFound.messages[0]);
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération du message :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération du message." });
  }
});







// Positive reactions
app.get('/user/:userId/positiveReactions', async (req, res) => {
  try {
    const { userId } = req.params;
    let userPositiveReactions = [];

    // Rechercher tous les modules contenant des cours créés par l'utilisateur avec des réactions
    const modules = await Module.find({ 'courses.creator.userId': userId });

    modules.forEach(module => {
      module.courses.forEach(course => {
        if (course.creator && course.creator.userId === userId && course.reactions) { 
          console.log(`Course creator found for user ${userId}:`, course.creator.userId);
          course.reactions.forEach(reaction => {
            if (reaction.reactionStyle === "positive") {
              console.log("Positive reaction found:", reaction);
              userPositiveReactions.push({
                moduleId: module.id,
                courseId: course.id,
                reaction
              });
            }
          });
        }
      });
    });

    console.log("User positive reactions:", userPositiveReactions);
    res.json({ userId, userPositiveReactions });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des réactions positives :", error);
    res.status(500).json({ message: "Une erreur s'est produite lors du traitement des données." });
  }
});


// All reactions

// Toutes les réactions
app.get('/user/:userId/allReactions', async (req, res) => {
  try {
    const { userId } = req.params;
    let userReactions = [];

    // Rechercher tous les modules contenant des cours créés par l'utilisateur avec des réactions
    const modules = await Module.find({ 'courses.creator.userId': userId });

    modules.forEach(module => {
      module.courses.forEach(course => {
        if (course.creator && course.creator.userId === userId && course.reactions) { 
          console.log(`Course creator found for user ${userId}:`, course.creator.userId);
          course.reactions.forEach(reaction => {
            console.log("Reaction found:", reaction);
            userReactions.push({
              moduleId: module.id,
              courseId: course.id,
              reaction
            });
          });
        }
      });
    });

    console.log("User reactions:", userReactions);
    res.json({ userId, userReactions });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des réactions :", error);
    res.status(500).json({ message: "Une erreur s'est produite lors du traitement des données." });
  }
});


app.post('/api/users/:userId/validateCourse', async (req, res) => {
  try {
    const { userId } = req.params;
    const { moduleId } = req.body;

    if (!moduleId) {
      return res.status(400).json({ message: 'Le moduleId est obligatoire.' });
    }

    let userCourses = await UserValidateCourse.findOne({ userId });

    if (!userCourses) {
      userCourses = new UserValidateCourse({
        userId,
        validatedCourses: []
      });
    }

    if (!userCourses.validatedCourses.includes(moduleId)) {
      userCourses.validatedCourses.push(moduleId);
      await userCourses.save();
    }

    res.status(200).json({
      message: 'Module validé avec succès',
      validatedCourses: userCourses.validatedCourses
    });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la validation du module :", error);
    res.status(500).json({ message: "Une erreur est survenue lors de la validation du module." });
  }
});


//  NOMBRE DE MODULE VALIDE
app.get('/api/user/:userId/validatedModulesCount', async (req, res) => {
  try {
    const { userId } = req.params;

    // Rechercher la progression de l'utilisateur dans la base de données
    const userProgress = await UserProgress.findOne({ userId });

    if (!userProgress) {
      return res.status(404).json({ message: 'Utilisateur non trouvé dans la base de données' });
    }

    // Compter le nombre de modules avec progress = "100.00%"
    const validatedModulesCount = userProgress.modules.filter(m => parseFloat(m.progress) === 100).length;

    res.json({
      userId,
      validatedModulesCount
    });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des modules validés :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des modules validés." });
  }
});


// PUSH LEVELS REWARDS INOT USERS
// 1) Chemin vers le fichier connectDatas.json
app.post('/api/users/:userId/achievements', async (req, res) => {
  try {
    const { userId } = req.params;
    const newAchievements = req.body; // ex: { allReactionsLevel: "Actif" }

    // Rechercher l'utilisateur par userId ou username
    const user = await User.findOne({ $or: [{ userId }, { username: userId }] });

    if (!user) {
      return res.status(404).json({ message: `Utilisateur "${userId}" non trouvé dans la base de données` });
    }

    // Vérifier si l'objet achievements existe, sinon l'initialiser
    if (!user.achievements) {
      user.achievements = {};
    }

    // Fusionner les nouvelles valeurs d'achievements
    Object.assign(user.achievements, newAchievements);

    // Sauvegarder les modifications dans la base de données
    await user.save();

    res.json({
      message: 'Achievements mis à jour avec succès',
      user
    });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la mise à jour des achievements :", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour des achievements." });
  }
});




// Companies 
app.get('/api/pending-companies', async (req, res) => {
  try {
    // Charger les entreprises en attente depuis la base de données
    let pendingCompanies = await Company.find({ pendingValidation: true });
    
    // Charger les données de gestion de projet pour récupérer les membres
    let projectCompanies = await ProjectManagement.find();
    
    // Fusionner les `members` depuis ProjectManagement dans Company
    pendingCompanies = pendingCompanies.map(company => {
      const projectCompany = projectCompanies.find(proj => proj.id === company.id);
      return {
        ...company.toObject(),
        members: projectCompany ? projectCompany.members : []
      };
    });
    
    console.log("✅ Données envoyées après fusion :", JSON.stringify(pendingCompanies, null, 2));
    res.json(pendingCompanies);
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des entreprises en attente :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des entreprises en attente de validation." });
  }
});









// Endpoint pour obtenir les entreprises en attente de validation

app.get('/api/pending-companies-true', async (req, res) => {
  try {
    // Filtrer les entreprises ayant `pendingValidation` à true dans MongoDB
    const pendingValidationCompanies = await Company.find({ pendingValidation: true });

    console.log("Sociétés en attente de validation :", pendingValidationCompanies);

    res.json(pendingValidationCompanies);
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des entreprises en attente de validation :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des entreprises en attente de validation." });
  }
});

app.get('/api/pending-companies-false', async (req, res) => {
  try {
    // Récupérer les entreprises dont pendingValidation est false
    const validatedCompanies = await Company.find({ pendingValidation: false });
    console.log("Entreprises validées :", validatedCompanies);
    res.json(validatedCompanies);
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des entreprises validées :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des entreprises validées." });
  }
});





function generateCompanyId() {
  const randomString = Math.random().toString(36).substring(2, 8); // Génération d'une chaîne de caractères aléatoires
  return `comp-${randomString}`;
}

// Endpoint pour ajouter une nouvelle entreprise en attente de validation
app.post('/api/pending-companies', async (req, res) => {
  try {
    const { companyName, description, userId, category, pendingValidation } = req.body;

    // Vérifier si une entreprise avec le même nom et le même utilisateur existe déjà
    const existingCompany = await Company.findOne({ companyName, userId });
    if (existingCompany) {
      return res.status(400).json({ message: 'Cette entreprise existe déjà.' });
    }

    // Créer une nouvelle entreprise
    const newCompany = new Company({
      id: new mongoose.Types.ObjectId().toString(), // Génération d'un ID unique
      companyName,
      description,
      userId,
      category,
      pendingValidation,
    });

    // Sauvegarder dans la base de données
    await newCompany.save();

    res.status(201).json(newCompany);
  } catch (error) {
    console.error("[SERVER] Erreur lors de l'ajout d'une entreprise :", error);
    res.status(500).json({ message: "Erreur serveur lors de l'ajout de l'entreprise." });
  }
});





// Endpoint pour mettre à jour l'état de validation d'une entreprise
app.put('/api/pending-companies/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { pendingValidation } = req.body;

    // Trouver et mettre à jour l'entreprise
    const company = await Company.findOneAndUpdate(
      { id: companyId },
      { pendingValidation },
      { new: true } // Retourner l'entreprise mise à jour
    );

    if (!company) {
      return res.status(404).json({ message: `Entreprise avec l'ID ${companyId} non trouvée.` });
    }

    res.status(200).json({ message: `État de validation mis à jour avec succès.`, company });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la mise à jour de l'état de validation :", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour de l'état de validation." });
  }
});

app.get('/api/pending-companies/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;

    // Trouver l'entreprise par son ID
    const company = await Company.findOne({ id: companyId });

    if (!company) {
      return res.status(404).json({ message: `Entreprise avec l'ID ${companyId} non trouvée.` });
    }

    res.status(200).json(company);
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des détails de l'entreprise :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des détails de l'entreprise." });
  }
});


// GESTION DE PROJETS


// Route pour enregistrer les données dans la gestion de projet
app.post('/api/project-management', async (req, res) => {
  try {
    const companiesData = req.body;
    console.log('Données reçues pour la gestion de projet :', companiesData);

    // Vérifier les doublons en base de données
    const existingCompanies = await ProjectManagement.find({ 
      id: { $in: companiesData.map(company => company.id) } 
    });

    // Filtrer les nouvelles entreprises qui n'existent pas encore
    const uniqueCompaniesData = companiesData.filter(newCompany => {
      return !existingCompanies.some(existingCompany => existingCompany.id === newCompany.id);
    });

    // Insérer les nouvelles entreprises en base de données
    if (uniqueCompaniesData.length > 0) {
      await ProjectManagement.insertMany(uniqueCompaniesData);
      console.log('Données enregistrées avec succès dans la gestion de projet.');
    }

    res.status(201).json({ message: 'Données enregistrées avec succès dans la gestion de projet.' });
  } catch (error) {
    console.error("[SERVER] Erreur lors de l'enregistrement des entreprises dans la gestion de projet :", error);
    res.status(500).json({ message: "Une erreur est survenue lors de l'enregistrement des données dans la gestion de projet." });
  }
});


// Route GET pour récupérer les membres d'une entreprise spécifique
app.get('/api/company/:companyId/members', async (req, res) => {
  try {
    const { companyId } = req.params;

    // Trouver l'entreprise correspondante dans la base de données
    const company = await ProjectManagement.findOne({ id: companyId });

    if (!company) {
      return res.status(404).json({ message: 'Entreprise non trouvée.' });
    }

    // Récupérer et renvoyer les membres de l'entreprise
    const members = company.members || [];
    res.json({ members });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des membres de l'entreprise :", error);
    res.status(500).json({ message: "Une erreur est survenue lors de la récupération des membres de l'entreprise." });
  }
});



//  récupérer les données user 


// Route GET pour récupérer tous les utilisateurs
app.get('/api/users', async (req, res) => {
  try {
    // Récupérer tous les utilisateurs ayant un username et un email
    const users = await User.find({ username: { $exists: true }, email: { $exists: true } }, 'username email');

    // Formater les utilisateurs pour renvoyer uniquement userId et email
    const formattedUsers = users.map(user => ({
      userId: user.username,
      email: user.email
    }));

    console.log('Données récupérées depuis la base de données :', formattedUsers);
    res.json(formattedUsers);
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des utilisateurs :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des utilisateurs." });
  }
});


// pousser les members
app.post('/api/company/:companyId/members', async (req, res) => {
  try {
    const { companyId } = req.params;
    const { userId, email } = req.body;

    // Vérifier que l'userId et l'email sont présents
    if (!userId || !email) {
      return res.status(400).json({ message: "L'userId et l'email sont requis." });
    }

    // Trouver l'entreprise par son ID
    const company = await ProjectManagement.findOne({ id: companyId });

    if (!company) {
      return res.status(404).json({ message: "Entreprise non trouvée." });
    }

    // Ajouter le nouveau membre
    company.members = company.members || [];
    company.members.push({ userId, email });

    // Sauvegarder les modifications en base de données
    await company.save();

    res.status(200).json({ message: "Membre ajouté avec succès." });
  } catch (error) {
    console.error("[SERVER] Erreur lors de l'ajout d'un membre :", error);
    res.status(500).json({ message: "Une erreur est survenue lors de l'ajout du membre." });
  }
});



// Route pour récupérer toutes les données des entreprises

app.get('/api/all-companies', async (req, res) => {
  try {
    // Récupérer toutes les entreprises depuis la base de données
    const companies = await ProjectManagement.find({});

    res.json(companies);
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des entreprises :", error);
    res.status(500).json({ message: "Une erreur est survenue lors de la récupération des entreprises." });
  }
});


// generate Program 

// Route POST pour ajouter un programme à une entreprise spécifique
  app.post('/api/company/:companyId/programs', async (req, res) => {
    try {
      const { companyId } = req.params;
      const { programName, description, programManager, participants, otherInfo } = req.body;
  
      // Vérification des données obligatoires
      if (!programName || !description || !programManager || !participants) {
        return res.status(400).json({ message: "Veuillez fournir tous les détails du programme." });
      }
  
      // Trouver l'entreprise correspondante dans la base de données
      const company = await ProjectManagement.findOne({ id: companyId });
  
      if (!company) {
        return res.status(404).json({ message: "Entreprise non trouvée." });
      }
  
      // Vérifie si la propriété 'programs' existe, sinon initialisez-la comme un tableau vide
      if (!company.programs) {
        company.programs = [];
      }
  
      // Création d'un nouvel objet programme
      const newProgram = {
        programId: new mongoose.Types.ObjectId().toString(),
        programName,
        description,
        programManager,
        participants,
        otherInfo
      };
  
      // Ajout du programme à la liste des programmes de l'entreprise
      company.programs.push(newProgram);
  
      // Sauvegarde dans la base de données
      await company.save();
  
      // Réponse avec le nouveau programme ajouté
      res.status(201).json(newProgram);
    } catch (error) {
      console.error("[SERVER] Erreur lors de l'ajout du programme :", error);
      res.status(500).json({ message: "Erreur serveur lors de l'ajout du programme." });
    }
  });
  

// Récupérer les programmes de company ID

// Route GET pour récupérer les programmes d'une entreprise spécifique
app.get('/api/company/:companyId/programs', async (req, res) => {
  try {
    const { companyId } = req.params;

    // Trouver l'entreprise correspondante dans la base de données
    const company = await ProjectManagement.findOne({ id: companyId });

    if (!company) {
      return res.status(404).json({ message: "Entreprise non trouvée." });
    }

    // Récupérer et renvoyer les programmes de l'entreprise
    const programs = company.programs || [];
    console.log("Programmes de l'entreprise :", programs);
    
    res.json(programs);
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des programmes :", error);
    res.status(500).json({ message: "Une erreur est survenue lors de la récupération des programmes." });
  }
});




// Fonction pour générer un identifiant unique pour le programme
function generateProgramId() {

  return 'prog-' + Math.random().toString(36).substr(2, 9);
}


// Route pour ajouter un nouveau projet

// Fonction pour générer un ID aléatoire de 10 caractères
const generateRandomId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomId = '';
  for (let i = 0; i < 10; i++) {
    randomId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomId;
};

app.post('/api/program/:programId/projects', async (req, res) => {
  try {
    const { programId } = req.params;
    const newProject = req.body;

    // Générer un ID unique pour le nouveau projet
    newProject.id = `${programId}-${generateRandomId()}`;

    // Trouver l'entreprise contenant le programme
    const company = await ProjectManagement.findOne({ "programs.programId": programId });

    if (!company) {
      return res.status(404).json({ message: "Programme non trouvé" });
    }

    // Trouver le programme spécifique
    const program = company.programs.find(prog => prog.programId === programId);
    if (!program) {
      return res.status(404).json({ message: "Programme non trouvé" });
    }

    // Ajouter le projet au programme
    if (!program.projects) {
      program.projects = [];
    }
    program.projects.push(newProject);

    // Sauvegarder les modifications en base de données
    await company.save();

    res.status(201).json({ message: "Projet ajouté avec succès", newProject });
  } catch (error) {
    console.error("[SERVER] Erreur lors de l'ajout du projet :", error);
    res.status(500).json({ message: "Erreur serveur lors de l'ajout du projet." });
  }
});



// Route GET pour récupérer les projets d'un programme spécifique
app.get('/api/company/:companyId/programs/:programId/projects', async (req, res) => {
  try {
    const { companyId, programId } = req.params;

    // Trouver l'entreprise contenant le programme
    const company = await ProjectManagement.findOne({ id: companyId });

    if (!company) {
      return res.status(404).json({ message: "Entreprise non trouvée." });
    }

    // Trouver le programme spécifique dans l'entreprise
    const program = company.programs.find(prog => prog.programId === programId);
    if (!program) {
      return res.status(404).json({ message: "Programme non trouvé." });
    }

    // Récupérer et renvoyer les projets du programme
    const projects = program.projects || [];
    console.log("Projets récupérés :", projects);

    res.json(projects);
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des projets :", error);
    res.status(500).json({ message: "Une erreur est survenue lors de la récupération des projets." });
  }
});


/// Route GET pour récupérer les participants d'un programme spécifique
app.get('/api/company/:companyId/program/:programId/participants', (req, res) => {
  const companyId = req.params.companyId.trim(); // Peut être un ID ou un nom
  const programId = req.params.programId.trim();

  console.log(`Requête reçue avec companyId: ${companyId}, programId: ${programId}`);

  const projectManagementPath = path.join(__dirname, 'json', 'projectmanagement.json');

  fs.readFile(projectManagementPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier JSON :', err);
      res.status(500).json({ message: 'Une erreur est survenue lors de la lecture du fichier JSON.' });
      return;
    }

    try {
      const companies = JSON.parse(data);
      console.log("Contenu brut du fichier JSON chargé avec succès.");

      // Trouver l'entreprise soit par `id`, soit par `companyName`
      const company = companies.find(
        company => company.id === companyId || company.companyName === companyId
      );

      if (!company) {
        console.error(`Aucune entreprise trouvée avec l'ID ou le nom : ${companyId}`);
        res.status(404).json({ message: 'Entreprise non trouvée.' });
        return;
      }
      console.log(`Entreprise trouvée : ${company.companyName}`);

      // Trouver le programme dans les programmes de l'entreprise
      const program = company.programs?.find(program => program.programId === programId);

      if (!program) {
        console.error(`Aucun programme trouvé avec l'ID : ${programId} dans l'entreprise ${company.companyName}`);
        res.status(404).json({ message: 'Programme non trouvé.' });
        return;
      }
      console.log(`Programme trouvé : ${program.programName}`);

      // Récupérer les participants
      const participants = program.participants || [];
      console.log("Participants récupérés :", participants);

      res.status(200).json(participants);
    } catch (error) {
      console.error('Erreur lors de l\'analyse des données JSON :', error);
      res.status(500).json({ message: 'Une erreur est survenue lors de l\'analyse des données JSON.' });
    }
  });
});


// GET Projets

app.get('/api/projects/:projectId', (req, res) => {
  const projectId = req.params.projectId;

  // Lire le fichier JSON contenant les données des entreprises
  fs.readFile(path.join(__dirname, 'json', 'projectmanagement.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier JSON :', err);
      res.status(500).json({ message: 'Une erreur est survenue lors de la lecture du fichier JSON.' });
      return;
    }

    try {
      const companies = JSON.parse(data);

      // Rechercher le projet correspondant par son ID dans toutes les entreprises
      for (const company of companies) {
        if (company.programs) {
          for (const program of company.programs) {
            if (program.projects) {
              const project = program.projects.find(project => project.id === projectId);
              if (project) {
                res.json(project);
                return;
              }
            }
          }
        }
      }

      // Si le projet n'est pas trouvé, renvoyer une réponse 404
      console.log('Aucun projet trouvé avec l\'ID :', projectId);
      res.status(404).json({ message: 'Projet non trouvé.' });
    } catch (error) {
      console.error('Erreur lors de la lecture des données JSON :', error);
      res.status(500).json({ message: 'Une erreur est survenue lors de la lecture des données JSON.' });
    }
  });
});

// Ajouter un lot

const lotData = require(path.join(__dirname, 'json', 'projectmanagement.json'));
const generateRandomLotString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }
  return randomString;
};

// Route POST pour ajouter un lot à un projet

app.post('/api/projects/:projectId/lots', (req, res) => {
  const dataFilePathLot = path.join(__dirname, 'json', 'projectmanagement.json');

  const { projectId } = req.params;
  const newLot = req.body;

  // Générer un ID unique pour le nouveau lot
  const lotId = `${projectId}-${generateRandomId()}`;
  newLot.id = lotId;

  // Charger les données actuelles depuis le fichier JSON
  const jsonData = loadDataFromJsonFile(dataFilePathLot);

  // Recherche de l'index du projet associé dans les données JSON
  const projectIndex = jsonData.findIndex(company =>
    company && company.programs && company.programs.some(program =>
      program && program.projects && program.projects.some(project =>
        project && project.id === projectId
      )
    )
  );

  // Si le projet est trouvé
  if (projectIndex !== -1) {
    const project = jsonData[projectIndex].programs
      .flatMap(program => program.projects)
      .find(project => project.id === projectId);

    if (project) {
      if (!project.lots) {
        project.lots = [];
      }
      project.lots.push(newLot);

      // Mettre à jour les données dans le fichier JSON
      saveDataToJsonFile(jsonData, dataFilePathLot);

      res.status(201).json({ message: 'Lot ajouté avec succès', newLot });
    } else {
      res.status(404).json({ message: 'Projet non trouvé' });
    }
  } else {
    res.status(404).json({ message: 'Projet non trouvé' });
  }
});

// recupérer les lots 

app.get('/api/projects/:projectId/lots', (req, res) => {
  const { projectId } = req.params;

  try {
    // Recherche du projet correspondant dans les données JSON
    const project = projectData.find(company =>
      company.programs.some(program =>
        program.projects && program.projects.some(project =>
          project.id === projectId
        )
      )
    );

    if (!project) {
      // Si le projet n'est pas trouvé, retourner une réponse 404
      return res.status(404).json({ message: 'Projet non trouvé' });
    }

    // Récupération des lots du projet
    let lots = [];
    project.programs.forEach(program =>
      program.projects && program.projects.forEach(project => {
        if (project.id === projectId && project.lots) {
          lots = project.lots;
        }
      })
    );

    // Retourner la liste des lots
    res.status(200).json(lots);
  } catch (error) {
    // En cas d'erreur, renvoyer une réponse d'erreur
    console.error('Erreur lors de la récupération des lots :', error);
    res.status(500).json({ message: 'Une erreur s\'est produite lors de la récupération des lots' });
  }
});

app.post('/api/projects/:projectId/lots/:lotId/brs', (req, res) => {
  const { projectId, lotId } = req.params;
  const newBR = req.body;
  const jsonData = require(path.join(__dirname, 'json', 'projectmanagement.json'));

  console.log('Données de la BR reçues côté serveur :', newBR);

    // Génération d'un ID aléatoire pour la BR
    const brId = generateRandomId(56);
    newBR.id = brId;

  // Recherche du projet correspondant par son ID
  const project = jsonData.find(company =>
    company.programs.some(program =>
      program.projects && program.projects.some(project =>
        project.id === projectId
      )
    )
  );

  if (!project) {
    console.log('Projet non trouvé');
    return res.status(404).json({ message: 'Projet non trouvé' });
  }

  console.log('Projet trouvé:', project);

  // Recherche du lot correspondant dans le projet
  const foundLot = project.programs.reduce((acc, program) => {
    if (!acc && program.projects) {
      program.projects.forEach(proj => {
        if (proj.id === projectId && proj.lots) {
          const lot = proj.lots.find(lot => lot.id === lotId);
          if (lot) {
            acc = lot;
          }
        }
      });
    }
    return acc;
  }, null);

  if (!foundLot) {
    console.log('Lot non trouvé dans le projet');
    return res.status(404).json({ message: 'Lot non trouvé dans le projet' });
  }

  console.log('Lot trouvé:', foundLot);

  // Ajout de la BR au lot
  if (!foundLot.brs) {
    foundLot.brs = [];
  }
  foundLot.brs.push(newBR);

  fs.writeFile(path.join(__dirname, 'json', 'projectmanagement.json'), JSON.stringify(jsonData, null, 2), (err) => {
    if (err) {
      console.error('Erreur lors de l\'écriture dans le fichier JSON :', err);
      return res.status(500).json({ message: 'Erreur lors de l\'écriture dans le fichier JSON' });
    }
    console.log('Données mises à jour enregistrées dans le fichier JSON');
    // Envoi de la réponse
    return res.status(200).json({ message: 'BR ajoutée avec succès au lot', lot: foundLot });
  });
});

// Route GET pour récupérer les br

// Route GET pour récupérer les BRs d'un lot d'un projet
app.get('/api/projects/:projectId/lots/:lotId/brs', async (req, res) => {
  try {
    const { projectId, lotId } = req.params;
    const company = await ProjectManagement.findOne({ "programs.projects.id": projectId });
    if (!company) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }
    let foundProject, foundLot;
    for (const program of company.programs) {
      foundProject = program.projects.find(p => p.id === projectId);
      if (foundProject) {
        foundLot = foundProject.lots ? foundProject.lots.find(l => l.id === lotId) : null;
        break;
      }
    }
    if (!foundProject) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }
    if (!foundLot) {
      return res.status(404).json({ message: "Lot non trouvé" });
    }
    if (!foundLot.brs || foundLot.brs.length === 0) {
      return res.status(404).json({ message: "Aucun BR trouvé pour ce lot" });
    }
    res.status(200).json(foundLot.brs);
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des BRs :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des BRs." });
  }
});

// Route POST pour ajouter une phase à une BR d'un lot d'un projet
const generateRandomPhaseId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 48; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
};

app.post('/api/projects/:projectId/lots/:lotId/brs/:brId/phases', async (req, res) => {
  try {
    const { projectId, lotId, brId } = req.params;
    const newPhase = req.body;

    const company = await ProjectManagement.findOne({ "programs.projects.id": projectId });
    if (!company) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }
    let foundProject, foundLot, foundBR;
    for (const program of company.programs) {
      foundProject = program.projects.find(p => p.id === projectId);
      if (foundProject) {
        foundLot = foundProject.lots ? foundProject.lots.find(l => l.id === lotId) : null;
        break;
      }
    }
    if (!foundProject) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }
    if (!foundLot) {
      return res.status(404).json({ message: "Lot non trouvé dans le projet" });
    }
    foundBR = foundLot.brs ? foundLot.brs.find(br => br.id === brId) : null;
    if (!foundBR) {
      return res.status(404).json({ message: "BR non trouvée dans le lot" });
    }

    if (!foundBR.phases) {
      foundBR.phases = [];
    }
    const newPhaseId = generateRandomPhaseId();
    const phaseWithId = { id: newPhaseId, ...newPhase };
    foundBR.phases.push(phaseWithId);

    await company.save();
    res.status(200).json({ message: "Phase ajoutée avec succès à la BR", phase: phaseWithId });
  } catch (error) {
    console.error("[SERVER] Erreur lors de l'ajout de la phase :", error);
    res.status(500).json({ message: "Erreur serveur lors de l'ajout de la phase." });
  }
});

// Route GET pour récupérer les phases d'une BR d'un lot d'un projet
app.get('/api/projects/:projectId/lots/:lotId/brs/:brId/phases', async (req, res) => {
  try {
    const { projectId, lotId, brId } = req.params;
    const company = await ProjectManagement.findOne({ "programs.projects.id": projectId });
    if (!company) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }
    let foundProject, foundLot, foundBR;
    for (const program of company.programs) {
      foundProject = program.projects.find(p => p.id === projectId);
      if (foundProject) {
        foundLot = foundProject.lots ? foundProject.lots.find(l => l.id === lotId) : null;
        break;
      }
    }
    if (!foundProject) {
      return res.status(404).json({ message: "Projet non trouvé" });
    }
    if (!foundLot) {
      return res.status(404).json({ message: "Lot non trouvé" });
    }
    foundBR = foundLot.brs ? foundLot.brs.find(br => br.id === brId) : null;
    if (!foundBR) {
      return res.status(404).json({ message: "BR non trouvée" });
    }
    const phases = foundBR.phases || [];
    res.status(200).json(phases);
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des phases :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des phases." });
  }
});


// Ticket

// Ticket Routes
app.post('/api/tickets', async (req, res) => {
  try {
    const { user, ticket } = req.body;
    const newTicket = new Ticket({
      id: generateTicketRandomId(),
      user,
      ...ticket
    });
    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (error) {
    console.error("[SERVER] Erreur lors de l'ajout du ticket :", error);
    res.status(500).json({ message: "Erreur serveur lors de l'ajout du ticket." });
  }
});

app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find({});
    res.json(tickets);
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des tickets :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des tickets." });
  }
});

app.get('/api/tickets/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findOne({ id: ticketId });
    if (!ticket) {
      return res.status(404).json({ error: "Ticket non trouvé" });
    }
    res.json(ticket);
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération du ticket :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération du ticket." });
  }
});

app.post('/api/tickets/:ticketId/validate', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { userId, action } = req.body;
    const ticket = await Ticket.findOne({ id: ticketId });
    if (!ticket) {
      return res.status(404).json({ error: "Ticket non trouvé" });
    }
    if (ticket.userId !== userId) {
      return res.status(403).json({ error: "Accès interdit: seul le créateur du ticket peut valider" });
    }
    ticket.pendingValidationTicket = action === "validate" ? "validated" : "waiting";
    if (action === "validate") {
      ticket.validationDate = new Date().toISOString();
    }
    await ticket.save();
    res.json({ message: `Ticket ${action === "validate" ? "validé" : "mis en attente"}`, validationDate: ticket.validationDate });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la validation du ticket :", error);
    res.status(500).json({ error: "Erreur serveur lors de la validation du ticket" });
  }
});

// Message Routes
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find({});
    console.log("[SERVER] Tickets récupérés depuis MongoDB :", tickets);  // ✅ Vérification des données récupérées
    res.json(tickets);
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des tickets :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des tickets." });
  }
});


app.post('/api/messages/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { userId, content, moduleId } = req.body;
    if (!userId || !content) {
      return res.status(400).json({ message: 'Le userId et le contenu du message sont obligatoires.' });
    }
    const ticket = await Ticket.findOne({ id: ticketId });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé.' });
    }
    if (ticket.userId !== userId && !(ticket.assigned || []).includes(userId)) {
      return res.status(403).json({ message: 'Utilisateur non autorisé à envoyer des messages sur ce ticket.' });
    }
    const newMessage = {
      messageId: `msg${Date.now()}`,
      userId,
      content,
      moduleId: moduleId || null,
      createdAt: new Date().toISOString(),
    };
    let messageDoc = await Message.findOne({ ticketId });
    if (messageDoc) {
      messageDoc.messages.push(newMessage);
    } else {
      messageDoc = new Message({ ticketId, messages: [newMessage] });
    }
    await messageDoc.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("[SERVER] Erreur lors de l'ajout du message :", error);
    res.status(500).json({ message: "Erreur serveur lors de l'ajout du message." });
  }
});

// Knowledge Routes for Tickets
app.get('/api/knowledge/search', async (req, res) => {
  try {
    const query = req.query.query.toLowerCase();
    const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'à', 'au', 'aux', 'en', 'avec', 'sur', 'pour', 'par', 'dans'];
    const searchTerms = query.split(' ').filter(term => !stopWords.includes(term) && term.length > 1);
    if (searchTerms.length === 0) {
      return res.json([]);
    }
    const synonymesDoc = await Synonym.findOne(); // On suppose qu'il y a un document Synonym
    const expandWithSynonyms = (terms) => {
      const expandedTerms = new Set(terms);
      terms.forEach(term => {
        if (synonymesDoc && synonymesDoc[term]) {
          synonymesDoc[term].forEach(syn => expandedTerms.add(syn));
        }
      });
      return Array.from(expandedTerms);
    };
    const expandedTerms = expandWithSynonyms(searchTerms);
    console.log('Termes étendus pour la recherche :', expandedTerms);
    const moduleResults = await Module.find({
      $or: expandedTerms.map(term => ({
        $or: [
          { title: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } },
          { content: { $regex: term, $options: 'i' } }
        ]
      }))
    });
    const moduleTicketResults = await ModuleTicket.find({
      content: { $regex: expandedTerms.join('|'), $options: 'i' }
    });
    const results = [...moduleResults, ...moduleTicketResults];
    if (results.length === 0) {
      console.log('Aucun résultat trouvé avec les termes étendus :', expandedTerms);
    }
    res.json(results);
  } catch (error) {
    console.error("[SERVER] Erreur lors de la recherche dans la connaissance :", error);
    res.status(500).json({ message: "Erreur serveur lors de la recherche dans la connaissance." });
  }
});


// création de moduleTicket.json 

const TICKETS_FILE = path.join(__dirname, 'json', 'tickets.json');
const USERS_FILE = path.join(__dirname, 'json', 'connectDatas.json');
const MODULES_TICKET_FILE = path.join(__dirname, 'json', 'moduleTicket.json');

// Fonction pour lire le fichier JSON des tickets
const readTicketsFile = () => {
    return JSON.parse(fs.readFileSync(TICKETS_FILE, 'utf-8'));
};

// Fonction pour lire le fichier JSON des utilisateurs
const readUsersFile = () => {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
};

// Fonction pour lire ou créer le fichier moduleTicket
const readOrCreateModulesTicketFile = () => {
    if (!fs.existsSync(MODULES_TICKET_FILE)) {
        fs.writeFileSync(MODULES_TICKET_FILE, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(MODULES_TICKET_FILE, 'utf-8'));
};

// Route pour créer un moduleTicket

// Route pour créer un moduleTicket
// Route GET pour récupérer un utilisateur spécifique
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ username: userId });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    res.json(user);
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération de l'utilisateur." });
  }
});

// Route GET pour vérifier les permissions d'un utilisateur sur un ticket
app.get('/api/checkPermissions/:ticketId/:userId', async (req, res) => {
  try {
    const { ticketId, userId } = req.params;

    const ticket = await Ticket.findOne({ id: ticketId });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket introuvable' });
    }

    const user = await User.findOne({ username: userId });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const isAdmin = user.role === 'admin';
    const isAssigned = ticket.assigned.includes(userId);
    const isSubscriber = ticket.subscribers.includes(userId);
    const isCreator = ticket.creator?.userId === userId;

    const isAuthorized = !isCreator && (isAdmin || isAssigned || isSubscriber);
    res.json({ isAuthorized });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la vérification des autorisations :", error);
    res.status(500).json({ message: "Erreur serveur lors de la vérification des autorisations." });
  }
});

// Route POST pour créer un moduleTicket
app.post('/api/moduleTicket', async (req, res) => {
  try {
    const { ticketId, userId, content } = req.body;

    if (!ticketId || !userId || !content) {
      return res.status(400).json({ message: 'TicketId, userId, et contenu sont requis.' });
    }

    const ticket = await Ticket.findOne({ id: ticketId });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé.' });
    }

    const user = await User.findOne({ username: userId });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Vérifier les autorisations de l'utilisateur
    const isAdmin = user.role === 'admin';
    const isAssigned = ticket.assigned.includes(userId);
    const isSubscriber = ticket.subscribers.includes(userId);

    if (!isAdmin && !isAssigned && !isSubscriber) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à créer un module pour ce ticket.' });
    }

    // Vérifier si le module a déjà été ajouté dans le feed
    const messageDoc = await Message.findOne({ ticketId });
    const moduleAlreadyExists = messageDoc?.messages.some(msg => msg.content.includes(`Module ajouté: ${content}`));

    if (moduleAlreadyExists) {
      return res.status(400).json({ message: 'Ce module a déjà été ajouté au feed.' });
    }

    const newModuleTicket = new ModuleTicket({
      id: `module_${Date.now()}`,
      ticketId,
      userId,
      content,
      createdAt: new Date().toISOString(),
    });

    await newModuleTicket.save();

    const newMessage = {
      messageId: `msg_${Date.now()}`,
      userId,
      content: `Module ajouté: ${content}`,
      createdAt: new Date().toISOString()
    };

    if (messageDoc) {
      messageDoc.messages.push(newMessage);
      await messageDoc.save();
    } else {
      await new Message({ ticketId, messages: [newMessage] }).save();
    }

    res.status(201).json({ newModuleTicket, moduleMessage: newMessage });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la création du moduleTicket :", error);
    res.status(500).json({ message: "Erreur serveur lors de la création du moduleTicket." });
  }
});

// Route PUT pour modifier un message d'un ticket
app.put('/api/messages/:ticketId/:messageId', async (req, res) => {
  try {
    const { ticketId, messageId } = req.params;
    const { content } = req.body;

    if (!ticketId || !messageId || !content) {
      return res.status(400).json({ message: 'TicketId, MessageId, et contenu sont requis.' });
    }

    const messageDoc = await Message.findOne({ ticketId });
    if (!messageDoc) {
      return res.status(404).json({ message: 'Ticket non trouvé.' });
    }

    const messageToUpdate = messageDoc.messages.find(msg => msg.messageId === messageId);
    if (!messageToUpdate) {
      return res.status(404).json({ message: 'Message non trouvé.' });
    }

    messageToUpdate.content += ` ${content}`;
    messageToUpdate.updatedAt = new Date().toISOString();
    await messageDoc.save();

    const moduleToUpdate = await ModuleTicket.findOne({ ticketId, id: messageId });
    if (moduleToUpdate) {
      moduleToUpdate.content += ` ${content}`;
      moduleToUpdate.updatedAt = new Date().toISOString();
      await moduleToUpdate.save();
    }

    res.status(200).json({ message: 'Message et module mis à jour avec succès.', updatedMessage: messageToUpdate });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la mise à jour du message :", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du message." });
  }
});


app.get('/api/moduleTicket/:ticketId/:messageId', async (req, res) => {
  try {
    const { ticketId, messageId } = req.params;
    const messageDoc = await Message.findOne({ ticketId });

    if (!messageDoc) {
      return res.status(404).json({ message: 'Ticket non trouvé.' });
    }

    const message = messageDoc.messages.find(msg => msg.messageId === messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé.' });
    }

    res.status(200).json({ content: message.content });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération du message :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération du message." });
  }
});


// Route pour récupérer les tickets en fonction de companyName
app.get('/api/companies/:companyName/tickets', async (req, res) => {
  try {
    const { companyName } = req.params;

    const companyExists = await ProjectManagement.findOne({ companyName });
    if (!companyExists) {
      return res.status(404).json({ message: 'Entreprise non trouvée' });
    }

    const filteredTickets = await Ticket.find({ organization: companyName });
    res.status(200).json(filteredTickets);
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des tickets :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des tickets." });
  }
});


// Route pour ajouter un module sélectionné au ticket et dans les messages
app.post('/api/tickets/:ticketId/selectedModule', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { moduleId } = req.body;

    const ticket = await Ticket.findOne({ id: ticketId });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket non trouvé.' });
    }

    ticket.selectedModule = moduleId;
    await ticket.save();

    let messageDoc = await Message.findOne({ ticketId });
    if (!messageDoc) {
      messageDoc = new Message({ ticketId, messages: [] });
    }
    messageDoc.messages.push({
      messageId: `msg_${Date.now()}`,
      userId: ticket.userId,
      content: `Module sélectionné: ${moduleId}`,
      createdAt: new Date().toISOString(),
    });

    await messageDoc.save();

    res.status(200).json({ message: 'Module sélectionné ajouté au ticket et aux messages avec succès', ticket });
  } catch (error) {
    console.error("[SERVER] Erreur lors de l'ajout du module sélectionné :", error);
    res.status(500).json({ message: "Erreur serveur lors de l'ajout du module sélectionné." });
  }
});


app.get('/api/compare/:ticketId', async (req, res) => {
  try {
    const { distance } = require('fastest-levenshtein');
    const { ticketId } = req.params;

    const ticket = await Ticket.findOne({ id: ticketId });
    if (!ticket) {
      return res.status(404).json({ error: '❌ Ticket non trouvé' });
    }

    const ticketDetail = ticket.detail?.trim();
    if (!ticketDetail) {
      return res.status(400).json({ error: 'Le détail du ticket est invalide' });
    }

    const cleanText = text => text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const calculateSimilarity = (text1, text2) => {
      const dist = distance(cleanText(text1), cleanText(text2));
      return 100 - (dist / Math.max(text1.length, text2.length)) * 100;
    };

    const similarityThreshold = 10;
    const modules = await Module.find({});
    const moduleTickets = await ModuleTicket.find({});

    const matchingModules = modules.flatMap(module =>
      module.courses.map(course => ({
        ...course,
        similarity: calculateSimilarity(ticketDetail, course.content),
      }))
    ).filter(course => course.similarity >= similarityThreshold);

    const matchingModuleTickets = moduleTickets.map(moduleTicket => ({
      ...moduleTicket,
      similarity: calculateSimilarity(ticketDetail, moduleTicket.content),
    })).filter(moduleTicket => moduleTicket.similarity >= similarityThreshold);

    const sortedResults = [...matchingModules, ...matchingModuleTickets]
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    res.json({ matchingModules: sortedResults });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la comparaison :", error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});



// Gestion de porjet 
app.post('/initialize', async (req, res) => {
  try {
    const { companyId, companyName, programId, programName, projectId, projectName } = req.body;

    let company = await DataCompanies.findOne({ id: companyId });
    if (!company) {
      company = new DataCompanies({
        id: companyId,
        companyName: companyName || "Nom de compagnie inconnu",
        programs: []
      });
    }

    let program = company.programs.find(p => p.programId === programId);
    if (!program) {
      program = {
        programId,
        programName: programName || "Programme inconnu",
        projects: []
      };
      company.programs.push(program);
    }

    let project = program.projects.find(p => p.id === projectId);
    if (!project) {
      project = {
        id: projectId,
        projectName: projectName || "Projet inconnu",
        tabs: []
      };
      program.projects.push(project);
    }

    await company.save();
    res.status(201).json({ message: "Initialisation réussie", company });
  } catch (error) {
    console.error("[SERVER] Erreur lors de l'initialisation :", error);
    res.status(500).json({ error: "Erreur lors de l'initialisation." });
  }
});



// Route POST pour ajouter une tab à un projet
app.post('/projects/:projectId/tabs', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { companyId, companyName, programId, programName, tabId, tabName } = req.body;

    let company = await DataCompanies.findOne({ id: companyId });
    if (!company) {
      company = new DataCompanies({
        id: companyId,
        companyName: companyName || "Nom de compagnie inconnu",
        programs: []
      });
    }

    let program = company.programs.find(p => p.programId === programId);
    if (!program) {
      program = { programId, programName: programName || "Programme inconnu", projects: [] };
      company.programs.push(program);
    }

    let project = program.projects.find(p => p.id === projectId);
    if (!project) {
      project = { id: projectId, projectName: "Projet inconnu", tabs: [] };
      program.projects.push(project);
    }

    if (project.tabs.some(tab => tab.tabId === tabId)) {
      return res.status(400).json({ error: "Une tab avec cet ID existe déjà." });
    }

    const newTab = { tabId, tabName, rows: [] };
    project.tabs.push(newTab);
    await company.save();

    res.status(201).json({ message: "Tab ajoutée avec succès.", tab: newTab });
  } catch (error) {
    console.error("[SERVER] Erreur lors de l'ajout de la tab :", error);
    res.status(500).json({ error: "Erreur serveur lors de l'ajout de la tab." });
  }
});

// Route GET pour récupérer les tabs d'un projet
app.get('/projects/:projectId/tabs', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { companyId, programId } = req.query;

    const company = await DataCompanies.findOne({ id: companyId });
    if (!company) return res.status(404).json({ error: 'Compagnie non trouvée.' });

    const program = company.programs.find(p => p.programId === programId);
    if (!program) return res.status(404).json({ error: 'Programme non trouvé.' });

    const project = program.projects.find(p => p.id === projectId);
    if (!project) return res.status(404).json({ error: 'Projet non trouvé.' });

    res.status(200).json({ tabs: project.tabs || [] });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des tabs :", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des tabs." });
  }
});

// Route POST pour ajouter une row à une tab
app.post('/tabs/:tabId/rows', async (req, res) => {
  try {
    const { tabId } = req.params;
    const { companyId, programId, projectId, rowId, rowName, owner, goal, priority, type, budget, actual, status } = req.body;

    const company = await DataCompanies.findOne({ id: companyId });
    if (!company) return res.status(404).json({ error: 'Compagnie introuvable.' });

    const program = company.programs.find(p => p.programId === programId);
    if (!program) return res.status(404).json({ error: 'Programme introuvable.' });

    const project = program.projects.find(proj => proj.id === projectId);
    if (!project) return res.status(404).json({ error: 'Projet introuvable.' });

    const tab = project.tabs.find(t => t.tabId === tabId);
    if (!tab) return res.status(404).json({ error: 'Tab introuvable.' });

    const remainingBudget = budget - actual;
    const newRow = {
      rowId: rowId || `row-${Date.now()}`,
      rowName,
      owner,
      goal,
      priority,
      type,
      budget,
      actual,
      remainingBudget,
      status,
    };

    if (!tab.rows) tab.rows = [];
    tab.rows.push(newRow);
    await company.save();

    res.status(201).json({ message: 'Row ajoutée avec succès.', row: newRow });
  } catch (error) {
    console.error("[SERVER] Erreur lors de l'ajout de la row :", error);
    res.status(500).json({ error: "Erreur serveur lors de l'ajout de la row." });
  }
});


// Route GET pour récupérer les rows d'une tab spécifique
app.get('/tabs/:tabId/rows', async (req, res) => {
  try {
    const { tabId } = req.params;
    const { companyId, programId, projectId } = req.query;

    const company = await DataCompanies.findOne({ id: companyId });
    if (!company) return res.status(404).json({ error: 'Compagnie introuvable.' });

    const program = company.programs.find(p => p.programId === programId);
    if (!program) return res.status(404).json({ error: 'Programme introuvable.' });

    const project = program.projects.find(proj => proj.id === projectId);
    if (!project) return res.status(404).json({ error: 'Projet introuvable.' });

    const tab = project.tabs.find(t => t.tabId === tabId);
    if (!tab) return res.status(404).json({ error: 'Tab introuvable.' });

    res.status(200).json({ rows: tab.rows || [] });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des rows :", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des rows." });
  }
});

// Route PUT pour mettre à jour le statut d'une row
app.put('/tabs/:tabId/rows/:rowId', async (req, res) => {
  try {
    const { tabId, rowId } = req.params;
    const { companyId, programId, projectId, status } = req.body;

    const company = await DataCompanies.findOne({ id: companyId });
    if (!company) return res.status(404).json({ error: 'Compagnie introuvable.' });

    const program = company.programs.find(p => p.programId === programId);
    if (!program) return res.status(404).json({ error: 'Programme introuvable.' });

    const project = program.projects.find(proj => proj.id === projectId);
    if (!project) return res.status(404).json({ error: 'Projet introuvable.' });

    const tab = project.tabs.find(t => t.tabId === tabId);
    if (!tab) return res.status(404).json({ error: 'Tab introuvable.' });

    const row = tab.rows.find(r => r.rowId === rowId);
    if (!row) return res.status(404).json({ error: 'Row introuvable.' });

    row.status = status;
    await company.save();

    res.status(200).json({ message: 'Statut mis à jour avec succès.', row });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la mise à jour du statut :", error);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour du statut." });
  }
});

// Route POST pour ajouter un projet fonctionnel à une row
app.post('/projects/:projectId/functional', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { rowId, name, estimatedGain, projectType, resourcesRequired, startDate, endDate, status, companyId, programId } = req.body;

    const company = await DataCompanies.findOne({ id: companyId });
    if (!company) return res.status(404).json({ error: 'Compagnie introuvable.' });

    const program = company.programs.find(p => p.programId === programId);
    if (!program) return res.status(404).json({ error: 'Programme introuvable.' });

    const project = program.projects.find(proj => proj.id === projectId);
    if (!project) return res.status(404).json({ error: 'Projet introuvable.' });

    let rowFound = null;
    for (const tab of project.tabs) {
      rowFound = tab.rows.find(r => r.rowId === rowId);
      if (rowFound) break;
    }

    if (!rowFound) return res.status(404).json({ error: 'Row introuvable.' });

    const functionalProject = {
      name,
      estimatedGain,
      projectType,
      resourcesRequired,
      startDate,
      endDate,
      status,
    };

    if (!rowFound.functionalProjects) {
      rowFound.functionalProjects = [];
    }
    rowFound.functionalProjects.push(functionalProject);

    await company.save();
    res.status(201).json(functionalProject);
  } catch (error) {
    console.error("[SERVER] Erreur lors de l'ajout du projet fonctionnel :", error);
    res.status(500).json({ error: "Erreur serveur lors de l'ajout du projet fonctionnel." });
  }
});

// Route GET pour récupérer les projets fonctionnels d'une row
app.get('/projects/:projectId/functional/:rowId', async (req, res) => {
  try {
    const { projectId, rowId } = req.params;
    const { companyId, programId } = req.query;

    const company = await DataCompanies.findOne({ id: companyId });
    if (!company) return res.status(404).json({ error: 'Compagnie introuvable.' });

    const program = company.programs.find(p => p.programId === programId);
    if (!program) return res.status(404).json({ error: 'Programme introuvable.' });

    const project = program.projects.find(proj => proj.id === projectId);
    if (!project) return res.status(404).json({ error: 'Projet introuvable.' });

    let rowFound = null;
    for (const tab of project.tabs) {
      rowFound = tab.rows.find(r => r.rowId === rowId);
      if (rowFound) break;
    }

    if (!rowFound || !rowFound.functionalProjects) {
      return res.status(404).json({ message: 'Aucun projet fonctionnel trouvé pour cette ligne.' });
    }

    res.status(200).json({ functionalProjects: rowFound.functionalProjects });
  } catch (error) {
    console.error("[SERVER] Erreur lors de la récupération des projets fonctionnels :", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des projets fonctionnels." });
  }
});

// 📌 Route GET pour récupérer tous les tickets d’enrichissement
app.get("/api/enrich-db", async (req, res) => {
  try {
    const tickets = await DBEntryTickets.findOne({});
    res.json(tickets || { positif: [], neutre: [], negatif: [] });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des tickets enrichis :", error);
    res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération des tickets enrichis." });
  }
});

// 📌 Route POST pour ajouter un nouveau ticket d’enrichissement
app.post("/api/enrich-db", async (req, res) => {
  try {
    const { text, category } = req.body;

    if (!text || !category) {
      return res.status(400).json({ success: false, message: "❌ Données manquantes" });
    }

    const dbData = await DBEntryTickets.findOne({});
    if (!dbData) {
      return res.status(400).json({ success: false, message: "❌ Catégorie invalide" });
    }

    dbData[category].push({ text, date: new Date().toISOString() });
    await dbData.save();

    res.json({ success: true, message: "✅ Ticket ajouté avec succès !" });
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout du ticket enrichi :", error);
    res.status(500).json({ success: false, message: "Erreur serveur lors de l'ajout du ticket enrichi." });
  }
});

// 📌 GET : Récupérer les tickets d'une catégorie spécifique
app.get("/api/enrich-db/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const dbData = await DBEntryTickets.findOne({});
    
    if (!dbData || !dbData[category]) {
      return res.status(400).json({ success: false, message: "❌ Catégorie invalide" });
    }

    res.json(dbData[category]);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des tickets enrichis :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// 📌 POST : Calculer la météo du projet en fonction des messages du créateur du ticket
app.post("/api/project-meteo/:ticketId", async (req, res) => {
  try {
    const { ticketId } = req.params;

    console.log("📌 Ticket ID reçu pour mise à jour météo:", ticketId);

    const ticket = await Ticket.findOne({ id: ticketId });
    if (!ticket) {
      return res.status(404).json({ success: false, message: "❌ Ticket non trouvé." });
    }

    const ticketMessages = await Message.findOne({ ticketId });
    if (!ticketMessages || !Array.isArray(ticketMessages.messages)) {
      return res.status(404).json({ success: false, message: "❌ Aucun message trouvé pour ce ticket." });
    }

    const dbEntries = await DBEntryTickets.findOne({});
    let similarityScores = { positif: 0, neutre: 0, negatif: 0 };
    let totalComparisons = 0;

    ticketMessages.messages.forEach((message) => {
      Object.keys(dbEntries).forEach((category) => {
        dbEntries[category].forEach((entry) => {
          if (message.content.toLowerCase().includes(entry.text.toLowerCase())) {
            console.log(`✅ Correspondance trouvée : "${message.content}" → "${entry.text}"`);
            similarityScores[category]++;
            totalComparisons++;
          }
        });
      });
    });

    console.log("📊 Résultat des similarités :", similarityScores);

    let meteo = "🌤 Indéterminée";
    if (totalComparisons > 0) {
      const dominantCategory = Object.keys(similarityScores).reduce((a, b) =>
        similarityScores[a] > similarityScores[b] ? a : b
      );

      switch (dominantCategory) {
        case "positif":
          meteo = "☀️ Positive";
          break;
        case "neutre":
          meteo = "🌤 Neutre";
          break;
        case "negatif":
          meteo = "🌧 Négative";
          break;
      }
    }

    ticket.meteo = meteo;
    await ticket.save();

    console.log(`✅ Météo calculée pour ${ticketId}: ${ticket.meteo}`);
    res.json({ success: true, meteo: ticket.meteo });
  } catch (error) {
    console.error("❌ Erreur lors du calcul de la météo du projet :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// 📌 GET : Récupérer la météo d’un projet spécifique
app.get("/api/project-meteo/:ticketId", async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await Ticket.findOne({ id: ticketId });

    if (!ticket) {
      return res.status(404).json({ success: false, message: "❌ Ticket non trouvé." });
    }

    res.json({ meteo: ticket.meteo });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de la météo du projet :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});


// Dashboard Components 


// 1) DashboardConsultedCourses
// ------------------------------------
// 1) DashboardConsultedCourses
// ------------------------------------
app.get('/api/dashboard-consulted-courses/:userId', (req, res) => {
  const { userId } = req.params;
  console.log('[SERVER] GET /dashboard-consulted-courses/:userId → userId =', userId);

  try {
    // Ajustez le chemin si nécessaire
    const modulesPath = path.join(__dirname, 'json', 'modules.json');
    console.log('[SERVER] Lecture du fichier modules.json depuis :', modulesPath);

    const rawData = fs.readFileSync(modulesPath, 'utf8');
    const modulesData = JSON.parse(rawData);

    console.log('[SERVER] Nombre de modules chargés :', modulesData.length);

    const consultedCourses = [];

    // On parcourt chaque module + courses
    modulesData.forEach(moduleItem => {
      if (Array.isArray(moduleItem.courses)) {
        moduleItem.courses.forEach(course => {
          // Vérifier s’il y a des réactions
          if (Array.isArray(course.reactions)) {
            // Vérifier si userId est présent dans reactions
            const hasReaction = course.reactions.some(r => r.userId === userId);
            if (hasReaction) {
              // On push un objet enrichi
              consultedCourses.push({
                moduleId: moduleItem.id,
                moduleTitle: moduleItem.title,
                courseId: course.id,
                courseTitle: course.title,
              });
            }
          }
        });
      }
    });

    console.log('[SERVER] consultedCourses trouvés :', consultedCourses.length);
    res.json({ consultedCourses });
  } catch (error) {
    console.error('Erreur /dashboard-consulted-courses :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ------------------------------------
// 2) DashboardProjectAssigned
// ------------------------------------
app.get('/api/dashboard-project-assigned/:userId', (req, res) => {
  const { userId } = req.params;
  console.log(`[SERVER] => GET /api/dashboard-project-assigned/${userId} called`);

  try {
    // Lecture du fichier projectmanagement.json
    const pmPath = path.join(__dirname, 'json', 'projectmanagement.json');
    console.log(`[SERVER] => Lecture du fichier : ${pmPath}`);
    const rawPM = fs.readFileSync(pmPath, 'utf8');
    const projectManagementData = JSON.parse(rawPM);

    console.log(`[SERVER] => projectmanagement.json chargé, nb companies = ${projectManagementData.length}`);

    const assignedProjects = [];

    // Parcourir chaque compagnie
    projectManagementData.forEach((company) => {
      console.log(`\n[SERVER] => Vérification de la compagnie: ${company.companyName} (id=${company.id})`);

      // 1) Vérifier si l'utilisateur est membre de la compagnie
      const isCompanyMember = company.members?.some(m => m.userId === userId);
      if (!isCompanyMember) {
        console.log(`[SERVER] => userId="${userId}" n'est pas membre de cette compagnie -> on ignore.`);
        return; // on passe à la compagnie suivante
      }
      console.log(`[SERVER] => userId="${userId}" EST membre de la compagnie ${company.companyName}`);

      // 2) Vérifier s'il existe des programmes
      if (company.programs && Array.isArray(company.programs)) {
        console.log(`[SERVER] => ${company.programs.length} programmes trouvés dans la compagnie`);
        company.programs.forEach((program) => {
          console.log(`[SERVER] => Vérification du programme: ${program.programName} (id=${program.programId})`);

          // Vérifier si l'utilisateur fait partie des participants du programme
          const isProgramParticipant = program.participants?.some(p => p.userId === userId);
          if (!isProgramParticipant) {
            console.log(`[SERVER] => userId="${userId}" n'est pas participant du programme -> on ignore.`);
            return;
          }
          console.log(`[SERVER] => userId="${userId}" EST participant du programme: ${program.programName}`);

          // 3) Parcourir chaque projet du programme
          if (program.projects && Array.isArray(program.projects)) {
            console.log(`[SERVER] => ${program.projects.length} projets trouvés dans ce programme`);
            program.projects.forEach((proj) => {
              console.log(`[SERVER] => Vérification du projet: ${proj.projectName || '(pas de nom)'} (id=${proj.id})`);

              // Vérifier si userId figure dans proj.participants
              if (proj.participants && proj.participants.includes(userId)) {
                console.log(`[SERVER] => userId="${userId}" est présent dans le projet -> on l'ajoute à assignedProjects`);
                assignedProjects.push({
                  companyId: company.id,
                  companyName: company.companyName,
                  programId: program.programId,
                  programName: program.programName,
                  projectId: proj.id,
                  projectName: proj.projectName || proj.id,
                });
              } else {
                console.log(`[SERVER] => userId="${userId}" n'est pas dans participants du projet -> on ignore.`);
              }
            });
          } else {
            console.log(`[SERVER] => Aucun tableau de projets dans ce programme -> on ignore.`);
          }
        });
      } else {
        console.log(`[SERVER] => Aucune liste de programmes dans la compagnie -> on ignore.`);
      }
    });

    console.log(`[SERVER] => assignedProjects final =>`, assignedProjects);
    res.json({ assignedProjects });
  } catch (error) {
    console.error('[SERVER] => Erreur /api/dashboard-project-assigned :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});





// ------------------------------------
// 3) DashboardValidatedCourses
// ------------------------------------
app.get('/api/dashboard-validated-courses/:userId', (req, res) => {
  const { userId } = req.params;
  console.log('[SERVER] GET /dashboard-validated-courses/:userId → userId =', userId);

  try {
    // Ajustez le chemin si nécessaire (selon le vrai nom de votre fichier)
    const validatedPath = path.join(__dirname, 'json', 'uservalidatecourse.json');
    console.log('[SERVER] Lecture du fichier userValidatedCourses.json depuis :', validatedPath);

    const rawData = fs.readFileSync(validatedPath, 'utf8');
    const allValidated = JSON.parse(rawData); // Suppose qu’il s’agit d’un tableau

    console.log('[SERVER] Nombre d\'entrées dans userValidatedCourses :', allValidated.length);

    // Trouver l’entrée correspondante à l’utilisateur
    const userEntry = allValidated.find(entry => entry.userId === userId);

    if (!userEntry) {
      console.log('[SERVER] Aucun cours validé pour userId =', userId);
      return res.json({ validatedCourses: [] });
    }

    console.log('[SERVER] validatedCourses trouvés :', userEntry.validatedCourses.length);
    res.json({
      validatedCourses: userEntry.validatedCourses || []
    });
  } catch (error) {
    console.error('Erreur /dashboard-validated-courses :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ------------------------------------
// 4) DashboardRewardsGets (placeholder)
// ------------------------------------
app.get('/dashboard-rewards-gets/:userId', (req, res) => {
  const { userId } = req.params;
  console.log('[SERVER] GET /dashboard-rewards-gets/:userId → userId =', userId);

  // Pour l’instant, on renvoie juste un message “en cours”
  console.log('[SERVER] RewardsGets route appelée, pas de logique particulière pour userId =', userId);

  res.json({
    message: `Section Rewards pour l'utilisateur ${userId} - En cours de construction...`
  });
});
// ✅ Lancement du serveur



// KNOWLEDGE ADVANCED

// Charger les fichiers JSON
const MODULES_FILE_PATH = path.join(__dirname, 'json/modules.json');
const PROJECT_MANAGEMENT_FILE = path.join(__dirname, 'json/projectManagement.json');

// 📌 Route 1 : Récupérer les companies de l'utilisateur
app.get('/api/user/:userId/companies', (req, res) => {
    const { userId } = req.params;

    fs.readFile(PROJECT_MANAGEMENT_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error("Erreur lors de la lecture du fichier :", err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }

        try {
            const projectManagement = JSON.parse(data);

            if (!Array.isArray(projectManagement)) {
                console.error("Format invalide pour projectManagement.json");
                return res.status(500).json({ message: 'Format invalide du fichier JSON' });
            }

            const userCompanies = projectManagement.filter(company =>
                company.members?.some(member => member.userId === userId) ||
                (company.assigned && company.assigned.some(assigned => assigned.userId === userId))
            );

            res.status(200).json(userCompanies);
        } catch (error) {
            console.error("Erreur de parsing JSON :", error);
            res.status(500).json({ message: 'Erreur serveur' });
        }
    });
});

// 📌 Route 2 : Récupérer les modules les plus interactifs pour un utilisateur
app.get('/api/user/:userId/most-viewed-modules', (req, res) => {
    const { userId } = req.params;

    fs.readFile(PROJECT_MANAGEMENT_FILE, 'utf8', (err, projectData) => {
        if (err) {
            console.error("Erreur lors de la lecture du fichier projectManagement.json :", err);
            return res.status(500).json({ message: 'Erreur serveur' });
        }

        fs.readFile(MODULES_FILE_PATH, 'utf8', (err, modulesData) => {
            if (err) {
                console.error("Erreur lors de la lecture du fichier modules.json :", err);
                return res.status(500).json({ message: 'Erreur serveur' });
            }

            try {
                const projectManagement = JSON.parse(projectData);
                const modules = JSON.parse(modulesData);

                if (!Array.isArray(projectManagement) || !Array.isArray(modules)) {
                    console.error("Format invalide des fichiers JSON");
                    return res.status(500).json({ message: 'Format invalide des fichiers JSON' });
                }

                // Trouver les companies de l'utilisateur
                const userCompanies = projectManagement.filter(company =>
                    company.members?.some(member => member.userId === userId) ||
                    (company.assigned && company.assigned.some(assigned => assigned.userId === userId))
                );

                if (userCompanies.length === 0) {
                    return res.status(200).json([]); // Aucune entreprise trouvée
                }

                // Récupérer tous les `userId` des membres de ces companies
                const companyUserIds = new Set();
                userCompanies.forEach(company => {
                    company.members?.forEach(member => companyUserIds.add(member.userId));
                    if (company.assigned) {
                        company.assigned.forEach(assigned => companyUserIds.add(assigned.userId));
                    }
                });

                // Compter le nombre de réactions par module des membres de la même company
                const moduleReactionsCount = {};

                modules.forEach(module => {
                    if (!module.courses || !Array.isArray(module.courses)) {
                        console.warn(`Module ${module.title} n'a pas de cours`);
                        return;
                    }

                    module.courses.forEach(course => {
                        if (!course.reactions || !Array.isArray(course.reactions)) {
                            return;
                        }

                        course.reactions.forEach(reaction => {
                            if (companyUserIds.has(reaction.userId)) {
                                moduleReactionsCount[module.id] = (moduleReactionsCount[module.id] || 0) + 1;
                            }
                        });
                    });
                });

                // Trier les modules par le nombre de réactions
                const sortedModules = modules
                    .filter(module => module.id in moduleReactionsCount)
                    .sort((a, b) => moduleReactionsCount[b.id] - moduleReactionsCount[a.id]);

                res.status(200).json(sortedModules);
            } catch (error) {
                console.error("Erreur lors du traitement des données :", error);
                res.status(500).json({ message: 'Erreur serveur' });
            }
        });
    });
});

// PROGRESION MODULE





// KNOWLEDGE ADVANCED




// Chemins vers les fichiers JSON
const CONNECT_DATA_FILE = path.join(__dirname, 'json', 'connectDatas.json');
const PROGRESS_FILE = path.join(__dirname, 'json', 'userProgress.json');

// Route POST pour mettre à jour la progression de l'utilisateur dans userProgress.json
// Route POST pour mettre à jour la progression de l'utilisateur dans userProgress.json
app.post('/api/user/:userId/update-progression', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Lire les données utilisateurs et modules en utilisant fsAsync
    const connectData = JSON.parse(await fsAsync.readFile(CONNECT_DATA_FILE, 'utf-8'));
    const modulesData = JSON.parse(await fsAsync.readFile(MODULES_FILE_PATH, 'utf-8'));

    // Trouver l'utilisateur par son username ou userId
    const user = connectData.find(u => u.username === userId || u.userId === userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Pour chaque module, calculer la progression en associant les cours validés (stockés dans user.courses)
    const modulesProgress = modulesData.map(module => {
      const moduleCourseIds = module.courses.map(course => course.id);
      const validatedCourses = user.courses ? user.courses.filter(courseId => moduleCourseIds.includes(courseId)) : [];
      const totalCourses = moduleCourseIds.length;
      const progressPercentage = totalCourses > 0 ? (validatedCourses.length / totalCourses) * 100 : 0;
      return {
        moduleId: module.id,
        moduleName: module.title,
        totalCourses,
        validatedCourses,
        progress: progressPercentage.toFixed(2) + '%'
      };
    }).filter(module => module.totalCourses > 0);

    // Lire les données actuelles de userProgress.json en utilisant fsAsync
    let progressData;
    try {
      progressData = JSON.parse(await fsAsync.readFile(PROGRESS_FILE, 'utf-8'));
    } catch (error) {
      progressData = [];
    }

    // Mettre à jour ou créer l'entrée pour cet utilisateur
    let userProgress = progressData.find(u => u.userId === userId);
    if (!userProgress) {
      userProgress = {
        userId,
        username: user.username,
        email: user.email,
        company: user.company || 'N/A',
        modules: modulesProgress
      };
      progressData.push(userProgress);
    } else {
      userProgress.modules = modulesProgress;
    }

    // Écrire les nouvelles données dans userProgress.json avec fsAsync
    await fsAsync.writeFile(PROGRESS_FILE, JSON.stringify(progressData, null, 2));
    res.status(200).json({ message: 'Progression mise à jour avec succès', userProgress });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la progression:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de la progression' });
  }
});


// Route GET pour récupérer la progression d'un utilisateur depuis userProgress.json
app.get('/api/user/:userId/progression', async (req, res) => {
  try {
    const { userId } = req.params;
    const progressData = JSON.parse(await fsAsync.readFile(PROGRESS_FILE, 'utf-8'));
    const userProgress = progressData.find(u => u.userId === userId);
    if (!userProgress) {
      return res.status(404).json({ message: 'Progression non trouvée pour cet utilisateur.' });
    }
    // Calculer le total des cours et le nombre total de cours validés
    let totalCourses = 0;
    let totalValidated = 0;
    userProgress.modules.forEach(module => {
      totalCourses += module.totalCourses;
      totalValidated += module.validatedCourses.length;
    });
    const overallProgressPercentage = totalCourses > 0 ? (totalValidated / totalCourses) * 100 : 0;
    res.status(200).json({
      ...userProgress,
      overallProgress: overallProgressPercentage.toFixed(2) + '%'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la progression:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de la progression' });
  }
});











// sert le React build
app.use(express.static(path.join(__dirname, '../mon-app-client/build')));

// catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../mon-app-client/build/index.html'));
});



// Lancement du serveur// Démarrer le serveur
app.listen(port, () => {
  console.log(`🚀 Serveur backend en écoute sur le port ${port}`);
});


