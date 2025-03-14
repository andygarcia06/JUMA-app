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
    console.log("[DEBUG] Liste complète des utilisateurs:", users);

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

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1h' });

    res.json({ success: true, token });

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

// Chemin vers le fichier userProgress.json
const userProgressFilePath = path.join(__dirname, 'json', 'userProgress.json');

// Fonction utilitaire pour lire userProgress.json
function readUserProgress() {
  try {
    const data = fs.readFileSync(userProgressFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erreur lors de la lecture de userProgress.json :', err);
    return [];
  }
}

// Route pour récupérer le nombre de modules validés à 100%
app.get('/api/user/:userId/validatedModulesCount', (req, res) => {
  const { userId } = req.params;
  const userProgressData = readUserProgress();

  // Cherche l'utilisateur dans userProgress.json
  const userData = userProgressData.find(u => u.userId === userId);

  if (!userData) {
    return res.status(404).json({ message: 'Utilisateur non trouvé dans userProgress.json' });
  }

  // Compte le nombre de modules avec progress = "100.00%"
  const validatedModulesCount = userData.modules.filter(m => parseFloat(m.progress) === 100).length;

  return res.json({
    userId,
    validatedModulesCount
  });
});

// PUSH LEVELS REWARDS INOT USERS
// 1) Chemin vers le fichier connectDatas.json
const userFilePath = path.join(__dirname, 'json', './jsonconnectDatas.json');

// 2) Lire le JSON
function readUsersFromFile() {
  try {
    const data = fs.readFileSync(userFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erreur lors de la lecture du fichier connectDatas.json :', err);
    return [];
  }
}

// 3) Écrire dans le JSON
function writeUsersToFile(users) {
  try {
    fs.writeFileSync(userFilePath, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('Erreur lors de l\'écriture dans connectDatas.json :', err);
  }
}
// Exemple de corps JSON envoyé par le front :
// { allReactionsLevel: "Actif" }

app.post('/api/users/:userId/achievements', (req, res) => {
  const { userId } = req.params;      // ex: "andy", "1", etc.
  const newAchievements = req.body;   // ex: { allReactionsLevel: "Actif" }

  // Lire le fichier
  const users = readUsersFromFile();

  // Trouver l'utilisateur, soit par userId, soit par username
  let user = users.find(u => u.userId === userId);
  if (!user) {
    user = users.find(u => u.username === userId);
  }

  // Si introuvable, renvoyer 404
  if (!user) {
    return res.status(404).json({ message: `Utilisateur "${userId}" non trouvé dans connectDatas.json` });
  }

  // Créer l'objet achievements si inexistant
  if (!user.achievements) {
    user.achievements = {};
  }

  // Fusionner les nouvelles clés
  // ex: user.achievements.allReactionsLevel = "Actif"
  for (const [key, value] of Object.entries(newAchievements)) {
    user.achievements[key] = value;
  }

  // Écrire la mise à jour dans le fichier
  writeUsersToFile(users);

  // Répondre avec un message de succès et l'utilisateur mis à jour
  return res.json({
    message: 'Achievements mis à jour avec succès',
    user
  });
});



// Companies 

let companiesDatabase = loadCompaniesDatabase();

app.get('/api/pending-companies', (req, res) => {
  let pendingCompanies = loadCompaniesDatabase(); // Charger depuis companies.json

  // Charger les données de projectmanagement.json pour récupérer les membres
  let projectManagementData = [];
  const filePath = path.join(__dirname, 'json', 'projectmanagement.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    if (data.trim() !== '') { 
      projectManagementData = JSON.parse(data);
    }
  }

  // 🔥 Fusionner les `members` depuis `projectmanagement.json` dans `companies.json`
  pendingCompanies = pendingCompanies.map(company => {
    // Trouver l'entreprise correspondante dans projectmanagement.json
    const projectCompany = projectManagementData.find(proj => proj.id === company.id);
    
    return {
      ...company,
      members: projectCompany ? projectCompany.members : [], // Ajouter les membres si trouvés
    };
  });

  console.log("✅ Données envoyées après fusion :", JSON.stringify(pendingCompanies, null, 2));

  res.json(pendingCompanies);
});





// Endpoint pour obtenir les entreprises en attente de validation
app.get('/api/pending-companies-true', (req, res) => {
  const pendingCompanies = loadCompaniesDatabase(); // Charger les données à partir du fichier JSON à chaque appel
  
  // Filtrer les entreprises ayant pendingValidation à true
  const pendingValidationCompanies = pendingCompanies.filter(company => company.pendingValidation === true);
  
  console.log("Sociétés en attente de validation : ", pendingValidationCompanies);
  
  res.json(pendingValidationCompanies);
});

app.get('/api/pending-companies-false', (req, res) => {
  const pendingCompanies = loadCompaniesDatabase(); // Charger les données à partir du fichier JSON à chaque appel
  
  // Filtrer les entreprises ayant pendingValidation à true
  const pendingValidationCompanies = pendingCompanies.filter(company => company.pendingValidation === false);
  
  console.log("Sociétés en attente de validation : ", pendingValidationCompanies);
  
  res.json(pendingValidationCompanies);
});





function generateCompanyId() {
  const randomString = Math.random().toString(36).substring(2, 8); // Génération d'une chaîne de caractères aléatoires
  return `comp-${randomString}`;
}

// Endpoint pour ajouter une nouvelle entreprise en attente de validation
app.post('/api/pending-companies', (req, res) => {
  const { companyName, description, userId, category, pendingValidation } = req.body;

  // Charger les données de la base de données
  let companiesDatabase = loadCompaniesDatabase();

  // Vérifier si une entreprise avec le même nom et le même utilisateur existe déjà
  const existingCompany = companiesDatabase.find(company => company.companyName === companyName && company.userId === userId);
  if (existingCompany) {
    return res.status(400).json({ message: 'Cette entreprise existe déjà.' });
  }

  // Ajouter la nouvelle entreprise à la base de données existante
  const newCompany = {
    id: generateCompanyId(), // Génération d'un identifiant unique
    companyName,
    description,
    userId,
    category,
    pendingValidation,
  };
  companiesDatabase.push(newCompany);

  // Sauvegarder la base de données mise à jour dans le fichier JSON
  saveCompaniesDatabase(companiesDatabase);

  // Recharger les données à partir de la base de données mise à jour
  companiesDatabase = loadCompaniesDatabase();

  res.status(201).json(newCompany);
});


// Fonction pour charger la base de données des entreprises depuis le fichier JSON
function loadCompaniesDatabase() {
  const dbPath = path.join(__dirname, 'json', 'companies.json');
  let loadedCompaniesDatabase = [];
  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath);
    if (data.length > 0) {
      loadedCompaniesDatabase = JSON.parse(data);
    }
  }
  return loadedCompaniesDatabase;
}


// Fonction pour sauvegarder la base de données des entreprises dans le fichier JSON
function saveCompaniesDatabase(companiesDatabase) {
  const dbPath = path.join(__dirname, 'json', 'companies.json');
  fs.writeFileSync(dbPath, JSON.stringify(companiesDatabase));
}

// Endpoint pour mettre à jour l'état de validation d'une entreprise
app.put('/api/pending-companies/:companyId', (req, res) => {
  const { companyId } = req.params;
  const { pendingValidation } = req.body;

  // Charger les données de la base de données
  let companiesDatabase = loadCompaniesDatabase();

  // Trouver l'entreprise avec l'ID correspondant
  const companyToUpdateIndex = companiesDatabase.findIndex(company => company.id === companyId);

  if (companyToUpdateIndex !== -1) {
    // Mettre à jour l'état de validation de l'entreprise
    companiesDatabase[companyToUpdateIndex].pendingValidation = pendingValidation;

    // Sauvegarder la base de données mise à jour dans le fichier JSON
    saveCompaniesDatabase(companiesDatabase);

    res.status(200).json({ message: `État de validation de l'entreprise avec l'ID ${companyId} mis à jour avec succès.` });
  } else {
    res.status(404).json({ message: `Entreprise avec l'ID ${companyId} non trouvée.` });
  }
});

app.get('/api/pending-companies/:companyId', (req, res) => {
  const { companyId } = req.params;

  // Charger les données de la base de données
  let companiesDatabase = loadCompaniesDatabase();

  // Trouver l'entreprise avec l'ID correspondant
  const companyDetails = companiesDatabase.find(company => company.id === companyId);

  if (companyDetails) {
    res.status(200).json(companyDetails); // Envoyer les détails de l'entreprise en tant que réponse
  } else {
    res.status(404).json({ message: `Entreprise avec l'ID ${companyId} non trouvée.` });
  }
});

// GESTION DE PROJETS


// Route pour enregistrer les données dans la gestion de projet
app.post('/api/project-management', (req, res) => {
  const companiesData = req.body;
  console.log('Données reçues pour la gestion de projet :', companiesData);

  try {
    // Vérifier si le répertoire existe, sinon le créer
    const directoryPath = './json';
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath);
    }

    // Charger les données existantes de projectmanagement.json
    let projectManagementData = [];
    const filePath = path.join(__dirname, 'json', 'projectmanagement.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      if (data.trim() !== '') { // Vérifier si le fichier n'est pas vide
        projectManagementData = JSON.parse(data);
      }
    }

    // Vérifier les doublons
    const uniqueCompaniesData = companiesData.filter(newCompany => {
      return !projectManagementData.some(existingCompany => existingCompany.id === newCompany.id);
    });

    // Ajouter les nouvelles données uniques au tableau existant
    projectManagementData.push(...uniqueCompaniesData);

    // Enregistrer les données dans projectmanagement.json
    fs.writeFileSync(filePath, JSON.stringify(projectManagementData));

    console.log('Données enregistrées avec succès dans la gestion de projet.');

    res.status(201).json({ message: 'Données enregistrées avec succès dans la gestion de projet.' });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des entreprises dans la gestion de projet :', error);
    res.status(500).json({ message: 'Une erreur est survenue lors de l\'enregistrement des données dans la gestion de projet.' });
  }
});

// Route GET pour récupérer les membres d'une entreprise spécifique
app.get('/api/company/:companyId/members', (req, res) => {
  const companyId = req.params.companyId;

  // Lire le fichier JSON contenant les données des entreprises
  fs.readFile(path.join(__dirname, 'json', 'projectmanagement.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier JSON :', err);
      res.status(500).json({ message: 'Une erreur est survenue lors de la lecture du fichier JSON.' });
      return;
    }

    try {
      const companies = JSON.parse(data);
      
      // Trouver l'entreprise correspondante par son ID
      const company = companies.find(company => company.id === companyId);

      if (!company) {
        res.status(404).json({ message: 'Entreprise non trouvée.' });
        return;
      }

      // Récupérer et renvoyer les membres de l'entreprise
      const members = company.members || [];
      res.json({ members });
    } catch (error) {
      console.error('Erreur lors de la lecture des données JSON :', error);
      res.status(500).json({ message: 'Une erreur est survenue lors de la lecture des données JSON.' });
    }
  });
});


//  récupérer les données user 

const connectDatas = require(path.join(__dirname, 'json', 'connectDatas.json'));

// Route GET pour récupérer tous les utilisateurs
app.get('/api/users', (req, res) => {
  fs.readFile(path.join(__dirname, 'json', 'connectDatas.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier JSON :', err);
      return res.status(500).json({ message: 'Erreur lors de la lecture du fichier JSON.' });
    }

    try {
      // Parsing du fichier JSON
      const users = JSON.parse(data);
      console.log('Données récupérées depuis le fichier JSON :', users);

      // Filtrer les utilisateurs ayant un nom d'utilisateur et un e-mail
      const filteredUsers = users.filter(user => user.username && user.email);
      // Formater les utilisateurs pour renvoyer uniquement userId et email
      const formattedUsers = filteredUsers.map(user => ({
        userId: user.username,
        email: user.email
      }));
      res.json(formattedUsers);
    } catch (error) {
      console.error('Erreur lors du parsing du fichier JSON :', error);
      res.status(500).json({ message: 'Erreur lors du parsing du fichier JSON.' });
    }
  });
});

// pousser les members

app.post('/api/company/:companyId/members', (req, res) => {
  const companyId = req.params.companyId;
  const { userId, email } = req.body; // Récupérer l'userId et l'email à partir du corps de la requête
  
  // Vérifier si l'userId et l'email sont présents dans le corps de la requête
  if (!userId || !email) {
    res.status(400).json({ message: 'L\'userId et l\'email sont requis.' });
    return;
  }

  // Lire le fichier JSON contenant les données des entreprises
  fs.readFile(path.join(__dirname, 'json', 'projectmanagement.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier JSON :', err);
      res.status(500).json({ message: 'Une erreur est survenue lors de la lecture du fichier JSON.' });
      return;
    }

    try {
      const companies = JSON.parse(data);
      
      // Trouver l'entreprise correspondante par son ID
      const company = companies.find(company => company.id === companyId);

      if (!company) {
        res.status(404).json({ message: 'Entreprise non trouvée.' });
        return;
      }

      // Ajouter le nouveau membre avec l'userId et l'email à l'entreprise
      company.members = company.members || [];
      company.members.push({ userId, email });

      // Enregistrer les modifications dans le fichier JSON des entreprises
      fs.writeFile(path.join(__dirname, 'json', 'projectmanagement.json'), JSON.stringify(companies, null, 2), 'utf8', err => {
        if (err) {
          console.error('Erreur lors de l\'écriture dans le fichier JSON :', err);
          res.status(500).json({ message: 'Une erreur est survenue lors de l\'écriture dans le fichier JSON.' });
          return;
        }
        
        // Réponse réussie
        res.status(200).json({ message: 'Membre ajouté avec succès.' });
      });
    } catch (error) {
      console.error('Erreur lors de la lecture des données JSON :', error);
      res.status(500).json({ message: 'Une erreur est survenue lors de la lecture des données JSON.' });
    }
  });
});


// Route pour récupérer toutes les données des entreprises

app.get('/api/all-companies', (req, res) => {
  fs.readFile(path.join(__dirname, 'json', 'projectmanagement.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier JSON :', err);
      res.status(500).json({ message: 'Une erreur est survenue lors de la lecture du fichier JSON.' });
      return;
    }

    try {
      const companies = JSON.parse(data);
      res.json(companies);
    } catch (error) {
      console.error('Erreur lors de la lecture des données JSON :', error);
      res.status(500).json({ message: 'Une erreur est survenue lors de la lecture des données JSON.' });
    }
  });
});

// generate Program 

// Route POST pour ajouter un programme à une entreprise spécifique
app.post('/api/company/:companyId/programs', (req, res) => {
  const companyId = req.params.companyId;
  const { programName, description, programManager, participants, otherInfo } = req.body;

  // Vérification des données obligatoires
  if (!programName || !description || !programManager || !participants) {
    return res.status(400).json({ message: 'Veuillez fournir tous les détails du programme.' });
  }

  // Lecture du fichier JSON
  fs.readFile(path.join(__dirname, 'json', 'projectmanagement.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier JSON :', err);
      return res.status(500).json({ message: 'Erreur lors de la lecture du fichier JSON.' });
    }

    try {
      // Parsing du fichier JSON
      const projectManagementData = JSON.parse(data);

      // Recherche de l'entreprise correspondante par son ID
      const company = projectManagementData.find(company => company.id === companyId);

      if (!company) {
        return res.status(404).json({ message: 'Entreprise non trouvée.' });
      }

      // Vérifie si la propriété 'programs' existe, sinon initialisez-la comme un tableau vide
      if (!company.programs) {
        company.programs = [];
      }

      // Création d'un nouvel objet programme
      const newProgram = {
        programId: generateProgramId(),
        programName,
        description,
        programManager,
        participants,
        otherInfo
      };

      // Ajout du programme à la liste des programmes de l'entreprise
      company.programs.push(newProgram);

      // Écriture du fichier JSON avec le nouveau programme ajouté
      fs.writeFile(path.join(__dirname, 'json', 'projectmanagement.json'), JSON.stringify(projectManagementData, null, 2), err => {
        if (err) {
          console.error('Erreur lors de l\'écriture du fichier JSON :', err);
          return res.status(500).json({ message: 'Erreur lors de l\'écriture du fichier JSON.' });
        }

        // Réponse avec le nouveau programme ajouté
        res.status(201).json(newProgram);
      });
    } catch (error) {
      console.error('Erreur lors du parsing du fichier JSON :', error);
      res.status(500).json({ message: 'Erreur lors du parsing du fichier JSON.' });
    }
  });
});

// Récupérer les programmes de company ID

// Route GET pour récupérer les programmes d'une entreprise spécifique
app.get('/api/company/:companyId/programs', (req, res) => {
  const companyId = req.params.companyId;

  // Lire le fichier JSON contenant les données des entreprises
  fs.readFile(path.join(__dirname, 'json', 'projectmanagement.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier JSON :', err);
      res.status(500).json({ message: 'Une erreur est survenue lors de la lecture du fichier JSON.' });
      return;
    }

    try {
      const companies = JSON.parse(data);
      
      // Trouver l'entreprise correspondante par son ID
      const company = companies.find(company => company.id === companyId);

      if (!company) {
        res.status(404).json({ message: 'Entreprise non trouvée.' });
        return;
      }

      // Récupérer et renvoyer les programmes de l'entreprise
      const programs = company.programs || [];
      console.log('Programmes de l\'entreprise', programs);
      res.json(programs);
    } catch (error) {
      console.error('Erreur lors de la lecture des données JSON :', error);
      res.status(500).json({ message: 'Une erreur est survenue lors de la lecture des données JSON.' });
    }
  });
});



// Fonction pour générer un identifiant unique pour le programme
function generateProgramId() {

  return 'prog-' + Math.random().toString(36).substr(2, 9);
}


// Route pour ajouter un nouveau projet

const dataFilePathProject = path.join(__dirname, 'json', 'projectmanagement.json');

// Fonction pour charger les données depuis le fichier JSON
const loadDataFromJsonFile = (filePath) => {
  try {
    const jsonData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier JSON :', error);
    return [];
  }
};

// Fonction pour sauvegarder les données dans le fichier JSON
const saveDataToJsonFile = (data, filePath) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('Données sauvegardées avec succès dans le fichier JSON.');
  } catch (error) {
    console.error('Erreur lors de l\'écriture dans le fichier JSON :', error);
  }
};


// Fonction pour générer un ID aléatoire de 10 caractères
const generateRandomId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomId = '';
  for (let i = 0; i < 10; i++) {
    randomId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomId;
};

// Route POST pour ajouter un projet à un programme
app.post('/api/program/:programId/projects', (req, res) => {
  const { programId } = req.params;
  const newProject = req.body;

  // Générer un ID unique pour le nouveau projet
  const projectId = `${programId}-${generateRandomId()}`;
  newProject.id = projectId;

  // Charger les données actuelles depuis le fichier JSON
  const jsonData = loadDataFromJsonFile(dataFilePathProject);

  // Recherche de l'index du programme associé dans les données JSON
  const programIndex = jsonData.findIndex(company =>
    company && company.programs && company.programs.some(program =>
      program && program.programId === programId
    )
  );

  // Si le programme est trouvé, ajoutez le nouveau projet à son tableau de projets
  if (programIndex !== -1) {
    if (!jsonData[programIndex].programs) {
      jsonData[programIndex].programs = [];
    }

    const program = jsonData[programIndex].programs.find(program => program.programId === programId);
    if (program) {
      if (!program.projects) {
        program.projects = [];
      }
      program.projects.push(newProject);
      
      // Mettre à jour les données dans le fichier JSON
      saveDataToJsonFile(jsonData, dataFilePathProject);

      res.status(201).json({ message: 'Projet ajouté avec succès', newProject });
    } else {
      res.status(404).json({ message: 'Programme non trouvé' });
    }
  } else {
    res.status(404).json({ message: 'Programme non trouvé' });
  }
});


// Route GET pour récupérer les projets d'un programme spécifique
app.get('/api/company/:companyId/programs/:programId/projects', (req, res) => {
  const companyId = req.params.companyId;
  const programId = req.params.programId;

  // Construire le chemin d'accès au fichier JSON contenant les données des entreprises
  const projectManagementPath = path.join(__dirname, 'json', 'projectmanagement.json');

  // Lire le fichier JSON
  fs.readFile(projectManagementPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier JSON :', err);
      res.status(500).json({ message: 'Une erreur est survenue lors de la lecture du fichier JSON.' });
      return;
    }

    try {
      const companies = JSON.parse(data);
      
      // Trouver l'entreprise correspondante par son ID
      const company = companies.find(company => company.id === companyId);

      if (!company) {
        res.status(404).json({ message: 'Entreprise non trouvée.' });
        return;
      }

      // Trouver le programme correspondant par son ID dans l'entreprise
      const program = company.programs.find(program => program.programId === programId);

      if (!program) {
        res.status(404).json({ message: 'Programme non trouvé.' });
        return;
      }

      // Récupérer et renvoyer les projets du programme
      const projects = program.projects || [];
      console.log('Projets récupérés :', projects); // Ajout du log pour voir les projets récupérés

      res.json(projects);
    } catch (error) {
      console.error('Erreur lors de la lecture des données JSON :', error);
      res.status(500).json({ message: 'Une erreur est survenue lors de la lecture des données JSON.' });
    }
  });
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

app.get('/api/projects/:projectId/lots/:lotId/brs', (req, res) => {
  const { projectId, lotId } = req.params;

  try {
    const projectBRData = require(path.join(__dirname, 'json', 'projectmanagement.json'));

    // Rechercher le projet correspondant par son ID dans toutes les entreprises
    for (const company of projectBRData) {
      if (company.programs) {
        for (const program of company.programs) {
          if (program.projects) {
            const project = program.projects.find(project => project.id === projectId);
            if (project) {
              // Si le projet est trouvé, vérifiez s'il contient des lots
              if (project.lots) {
                // Recherchez le lot correspondant par son ID
                const lot = project.lots.find(lot => lot.id === lotId);
                if (lot) {
                  // Si le lot est trouvé, vérifiez s'il contient des BRs
                  if (lot.brs) {
                    // Renvoyer les BRs du lot correspondant
                    res.json(lot.brs);
                    return;
                  } else {
                    // Si le lot ne contient pas de BRs, renvoyer un message indiquant l'absence de BRs
                    res.status(404).json({ message: 'Aucun BR trouvé pour ce lot' });
                    return;
                  }
                } else {
                  // Si le lot n'est pas trouvé, renvoyer un message indiquant l'absence de lot avec cet ID
                  res.status(404).json({ message: 'Lot non trouvé' });
                  return;
                }
              } else {
                // Si le projet ne contient pas de lots, renvoyer un message indiquant l'absence de lots
                res.status(404).json({ message: 'Aucun lot trouvé pour ce projet' });
                return;
              }
            }
          }
        }
      }
    }
    // Si aucun projet correspondant n'est trouvé, renvoyer un message indiquant l'absence de projet avec cet ID
    res.status(404).json({ message: 'Projet non trouvé' });
  } catch (error) {
    console.error('Erreur lors de la recherche du projet, des lots et des BRs :', error);
    res.status(500).json({ message: 'Une erreur s\'est produite lors de la recherche du projet, des lots et des BRs' });
  }
});

// Route POST Phases

const generateRandomPhaseId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 48; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }
  return randomString;
};

app.post('/api/projects/:projectId/lots/:lotId/brs/:brId/phases', (req, res) => {
  const { projectId, lotId, brId } = req.params;
  const newPhase = req.body;

  const jsonData = require(path.join(__dirname, 'json', 'projectmanagement.json'));

  console.log('Données de la Phase reçues côté serveur :', newPhase);

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

  // Recherche de la BR correspondante dans le lot
  const foundBR = foundLot.brs.find(br => br.id === brId);

  if (!foundBR) {
    console.log('BR non trouvée dans le lot');
    return res.status(404).json({ message: 'BR non trouvée dans le lot' });
  }

  // Ajout de la phase à la BR
  if (!foundBR.phases) {
    foundBR.phases = [];
  }
  const newPhaseId = generateRandomPhaseId();
  const phaseWithId = { id: newPhaseId, ...newPhase };
  foundBR.phases.push(phaseWithId);

  // Enregistrement des données mises à jour dans le fichier JSON
  fs.writeFile(path.join(__dirname, 'json', 'projectmanagement.json'), JSON.stringify(jsonData, null, 2), (err) => {
    if (err) {
      console.error('Erreur lors de l\'écriture dans le fichier JSON :', err);
      return res.status(500).json({ message: 'Erreur lors de l\'écriture dans le fichier JSON' });
    }
    console.log('Données mises à jour enregistrées dans le fichier JSON');
    // Envoi de la réponse
    return res.status(200).json({ message: 'Phase ajoutée avec succès à la BR', phase: newPhase });
  });
});

// GET Phases

app.get('/api/projects/:projectId/lots/:lotId/brs/:brId/phases', (req, res) => {
  const { projectId, lotId, brId } = req.params;
  const jsonData = require(path.join(__dirname, 'json', 'projectmanagement.json'));

  // Recherche de la BR correspondante par son ID
  const br = jsonData.reduce((acc, company) => {
    if (!acc) {
      company.programs.forEach(program => {
        if (!acc && program.projects) {
          program.projects.forEach(project => {
            if (!acc && project.id === projectId && project.lots) {
              project.lots.forEach(lot => {
                if (!acc && lot.id === lotId && lot.brs) {
                  const foundBR = lot.brs.find(br => br.id === brId);
                  if (foundBR) {
                    acc = foundBR;
                  }
                }
              });
            }
          });
        }
      });
    }
    return acc;
  }, null);

  if (!br) {
    console.log('Aucune BR trouvée pour cet ID');
    return res.status(404).json([]);
  }

  // Vérifier si des phases sont associées à cette BR
  const phases = br.phases || [];

  return res.status(200).json(phases);
});

// Ticket

const dbFilePath = path.join(__dirname, 'json', 'tickets.json');

// Middleware pour parser le JSON des requêtes
app.use(express.json());

// Fonction pour générer un ID aléatoire de 8 caractères (lettres + chiffres)
const generateTicketRandomId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
};

// Lire les tickets depuis le fichier JSON
const readTicketsFromFile = () => {
  try {
    const data = fs.readFileSync(dbFilePath, 'utf8');
    if (data.trim() === '') {
      return []; // Retourner un tableau vide si le fichier est vide
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading tickets file:', err);
    return []; // Retourner un tableau vide en cas d'erreur de lecture
  }
};


// Écrire les tickets dans le fichier JSON
const writeTicketsToFile = (tickets) => {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(tickets, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing tickets file:', err);
  }
};

// Route pour ajouter un ticket
app.post('/api/tickets', (req, res) => {
  const { user, ticket } = req.body;
  const newTicket = {
    id: generateTicketRandomId(),
    user,
    ...ticket
  };

  const tickets = readTicketsFromFile();
  tickets.push(newTicket);
  writeTicketsToFile(tickets);
  res.status(201).json(newTicket);
});

// Route pour récupérer tous les tickets
app.get('/api/tickets', (req, res) => {
  const tickets = readTicketsFromFile();
  res.json(tickets);
});

app.get('/api/tickets/:ticketId', (req, res) => {
  const { ticketId } = req.params;
  const tickets = readJSONFile(DB_TICKETS_PATH); // Fonction qui lit tickets.json
  const ticket = tickets.find(t => t.id === ticketId);

  if (!ticket) {
      return res.status(404).json({ error: "Ticket non trouvé" });
  }

  res.json(ticket);
});


app.post('/api/tickets/:ticketId/validate', (req, res) => {
    const { ticketId } = req.params;
    const { userId, action } = req.body;

    // Charger les tickets depuis le fichier JSON
    fs.readFile(dbFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lecture tickets:', err);
            return res.status(500).json({ error: 'Erreur interne serveur' });
        }

        let tickets = JSON.parse(data);
        let ticket = tickets.find(t => t.id === ticketId);

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket non trouvé' });
        }

        // Vérifier si l'utilisateur est bien le créateur du ticket
        if (ticket.userId !== userId) {
            return res.status(403).json({ error: 'Accès interdit: seul le créateur du ticket peut valider' });
        }

        // Met à jour l'état du ticket et enregistre la date de validation si validé
        ticket.pendingValidationTicket = action === "validate" ? "validated" : "waiting";
        
        if (action === "validate") {
            ticket.validationDate = new Date().toISOString(); // Ajoute la date de validation
        }

        // Sauvegarder les modifications
        fs.writeFile(dbFilePath, JSON.stringify(tickets, null, 2), (err) => {
            if (err) {
                console.error('Erreur écriture tickets:', err);
                return res.status(500).json({ error: 'Erreur enregistrement' });
            }
            res.json({ message: `Ticket ${action === "validate" ? "validé" : "mis en attente"}`, validationDate: ticket.validationDate });
        });
    });
});




// Fonction pour lire les messages depuis le fichier JSON
const readMessagesFromFile = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'json', 'messages.json'), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erreur lors de la lecture des messages:', err);
    return [];
  }
};

// Fonction pour écrire les messages dans le fichier JSON
const writeMessagesToFile = (messages) => {
  try {
    fs.writeFileSync(path.join(__dirname, 'json', 'messages.json'), JSON.stringify(messages, null, 2), 'utf8');
  } catch (err) {
    console.error('Erreur lors de l\'écriture des messages:', err);
  }
};

// Route pour récupérer les messages liés à un ticket spécifique
app.get('/api/messages/:ticketId', (req, res) => {
  const { ticketId } = req.params;
  const messages = readMessagesFromFile(); // Lire le fichier des messages

  const ticketMessages = messages.find(ticket => ticket.ticketId === ticketId);

  if (ticketMessages) {
    res.json(ticketMessages.messages);
  } else {
    res.status(404).json({ message: 'Aucun message trouvé pour ce ticket' });
  }
});

// Route pour ajouter un message à un ticket// Route pour ajouter un message à un ticket
app.post('/api/messages/:ticketId', (req, res) => {
  const { ticketId } = req.params;
  const { userId, content, moduleId } = req.body;

  // Vérification des champs obligatoires
  if (!userId || !content) {
    return res.status(400).json({ message: 'Le userId et le contenu du message sont obligatoires.' });
  }

  // Lecture des tickets depuis le fichier
  const tickets = readTicketsFromFile();
  const ticket = tickets.find(ticket => ticket.id === ticketId);

  if (!ticket) {
    return res.status(404).json({ message: 'Ticket non trouvé.' });
  }

  // Vérification des permissions utilisateur
  if (ticket.userId !== userId && !ticket.assigned.includes(userId)) {
    return res.status(403).json({ message: 'Utilisateur non autorisé à envoyer des messages sur ce ticket.' });
  }

  // Lecture des messages existants
  const messages = readMessagesFromFile();
  let ticketMessages = messages.find(msg => msg.ticketId === ticketId);

  // Création d'un nouvel objet message
  const newMessage = {
    messageId: `msg${Date.now()}`, // Génération d'un ID unique pour le message
    userId,
    content,
    moduleId: moduleId || null, // Inclure moduleId si fourni
    createdAt: new Date().toISOString(),
  };

  if (ticketMessages) {
    // Ajouter le message aux messages existants du ticket
    ticketMessages.messages.push(newMessage);
  } else {
    // Créer une nouvelle liste de messages pour ce ticket
    ticketMessages = {
      ticketId,
      messages: [newMessage],
    };
    messages.push(ticketMessages);
  }

  // Sauvegarde des messages mis à jour
  writeMessagesToFile(messages);

  // Réponse au client
  res.status(201).json(newMessage);
});


// KNOWLEDGE ROUTES FOR TICEKTS
const synonymesFilePath = path.join(__dirname, 'json', 'synonymes.json');
const synonymes = JSON.parse(fs.readFileSync(synonymesFilePath, 'utf8'));

// Fonction pour étendre les termes de la requête avec les synonymes
const expandWithSynonyms = (terms) => {
  return terms.flatMap(term => synonymes[term] ? [term, ...synonymes[term]] : [term]);
};


app.get('/api/knowledge/search', (req, res) => {
  const query = req.query.query.toLowerCase(); // Récupérer la chaîne de recherche dans la requête

  // Liste des déterminants à exclure
  const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'à', 'au', 'aux', 'en', 'avec', 'sur', 'pour', 'par', 'dans'];

  // Séparer la phrase en mots clés, et filtrer les déterminants
  const searchTerms = query.split(' ').filter(term => !stopWords.includes(term) && term.length > 1);

  if (searchTerms.length === 0) {
    return res.json([]); // Aucun mot clé pertinent
  }

  const modulesFilePath = path.join(__dirname, 'json', 'modules.json');
  const moduleTicketsFilePath = path.join(__dirname, 'json', 'moduleTickets.json');

  // Fonction pour étendre les termes avec les synonymes
  const expandWithSynonyms = (terms) => {
    const expandedTerms = new Set(terms);
    terms.forEach(term => {
      if (synonymes[term]) {
        synonymes[term].forEach(synonym => expandedTerms.add(synonym));
      }
    });
    return Array.from(expandedTerms);
  };

  // Étendre les termes de la requête avec les synonymes
  const expandedTerms = expandWithSynonyms(searchTerms);
  console.log('Termes étendus pour la recherche :', expandedTerms);

  // Fonction de recherche dans les modules et moduleTickets
  const searchInData = (data, terms) => {
    return data.filter(module => {
      // Utilisation de valeurs par défaut pour éviter 'undefined'
      const title = module.title || '';
      const description = module.description || '';
      const content = module.content || '';

      // Concaténation des champs (titre, description, contenu)
      const textToSearch = `${title} ${description} ${content}`.toLowerCase();

      // Vérifier si au moins un terme correspond
      return terms.some(term => textToSearch.includes(term.toLowerCase()));
    });
  };

  // Lire les deux fichiers et effectuer la recherche
  fs.readFile(modulesFilePath, 'utf8', (err, moduleData) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier modules.json:', err);
      return res.status(500).json({ message: 'Erreur interne du serveur' });
    }

    fs.readFile(moduleTicketsFilePath, 'utf8', (err, moduleTicketsData) => {
      if (err) {
        console.error('Erreur lors de la lecture du fichier moduleTickets.json:', err);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
      }

      const modules = JSON.parse(moduleData);
      const moduleTickets = JSON.parse(moduleTicketsData);

      // Rechercher dans les deux fichiers
      const moduleResults = searchInData(modules, expandedTerms);
      const moduleTicketResults = searchInData(moduleTickets, expandedTerms);

      // Fusionner les résultats
      const results = [...moduleResults, ...moduleTicketResults];

      if (results.length === 0) {
        console.log('Aucun résultat trouvé avec les termes étendus :', expandedTerms);
      }

      res.json(results); // Retourner les résultats
    });
  });
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

const TICKETS2_FILE = path.join(__dirname, 'json', 'tickets.json');
const USERS2_FILE = path.join(__dirname, 'json', 'connectDatas.json');
const MODULE_TICKETS_FILE = path.join(__dirname, 'json', 'moduleTickets.json');
const MESSAGES_FILE = path.join(__dirname, 'json', 'messages.json');


// Fonction pour lire les fichiers JSON
const readJsonFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      // Si le fichier n'existe pas, créer un fichier vide avec un tableau vide
      fs.writeFileSync(filePath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) || [];
  } catch (error) {
    console.error(`Erreur lors de la lecture du fichier ${filePath}:`, error);
    return [];
  }
};

// Fonction pour écrire dans un fichier JSON
const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Erreur lors de l'écriture dans le fichier ${filePath}:`, error);
  }
};

// Route pour récupérer les informations d'un utilisateur
app.get('/api/users/:userId', (req, res) => {
  const { userId } = req.params;
  const users = readJsonFile(USERS2_FILE);
  const user = users.find(u => u.username === userId);

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'Utilisateur non trouvé.' });
  }
});

// Route pour vérifier les permissions
app.get('/api/checkPermissions/:ticketId/:userId', (req, res) => {
  const { ticketId, userId } = req.params;

  try {
    const tickets = readJsonFile(TICKETS2_FILE);
    const users = readJsonFile(USERS2_FILE);

    const ticket = tickets.find(t => t.id === ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket introuvable' });
    }

    const user = users.find(u => u.username === userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const isAdmin = user.role === 'admin';
    const isAssigned = Array.isArray(ticket.assigned) && ticket.assigned.includes(userId);
    const isSubscriber = Array.isArray(ticket.subscribers) && ticket.subscribers.includes(userId);
    const isCreator = ticket.creator && ticket.creator.userId === userId;

    const isAuthorized = !isCreator && (isAdmin || isAssigned || isSubscriber);

    res.json({ isAuthorized });
  } catch (error) {
    console.error('Erreur lors de la vérification des autorisations:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la vérification des autorisations' });
  }
});


// Fonction utilitaire pour ajouter un message au ticket
const addMessageToTicket = (ticketId, userId, content) => {
  const messages = readMessagesFromFile();
  let ticketMessages = messages.find(msg => msg.ticketId === ticketId);

  const newMessage = {
    messageId: `msg${Date.now()}`, // Générer un ID de message unique
    userId,
    content,
    createdAt: new Date().toISOString(),
  };

  if (ticketMessages) {
    ticketMessages.messages.push(newMessage);
  } else {
    ticketMessages = {
      ticketId,
      messages: [newMessage],
    };
    messages.push(ticketMessages);
  }

  writeMessagesToFile(messages); // Sauvegarder les messages dans le fichier JSON
};

// Route pour créer un moduleTicket
app.post('/api/moduleTicket', (req, res) => {
  const { ticketId, userId, content } = req.body;

  // Vérification des données d'entrée
  if (!ticketId || !userId || !content) {
    return res.status(400).json({ message: 'TicketId, userId, et contenu sont requis.' });
  }

  // Lire les données des fichiers JSON
  const tickets = readJsonFile(TICKETS2_FILE);
  const users = readJsonFile(USERS2_FILE);
  const moduleTickets = readJsonFile(MODULE_TICKETS_FILE);
  const messages = readJsonFile(MESSAGES_FILE); // Ajout pour lire les messages

  // Chercher le ticket et l'utilisateur
  const ticket = tickets.find(t => t.id === ticketId);
  const user = users.find(u => u.username === userId);

  // Si le ticket ou l'utilisateur n'est pas trouvé
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket non trouvé.' });
  }
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé.' });
  }

  // Vérifier les autorisations de l'utilisateur
  const isAdmin = user.role === 'admin';
  const isAssigned = Array.isArray(ticket.assigned) && ticket.assigned.includes(userId); // Vérification de l'assignation
  const isSubscriber = Array.isArray(ticket.subscribers) && ticket.subscribers.includes(userId); // Vérification des abonnements

  if (!isAdmin && !isAssigned && !isSubscriber) {
    return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à créer un module pour ce ticket.' });
  }

  // Vérifier si le module a déjà été ajouté dans le feed
  const moduleAlreadyExists = messages.some(message => 
    message.ticketId === ticketId && message.content && message.content.includes(`Module ajouté: ${content}`)
  );

  if (moduleAlreadyExists) {
    return res.status(400).json({ message: 'Ce module a déjà été ajouté au feed.' });
  }

  // Créer le nouveau moduleTicket
  const newModuleTicket = {
    id: `module_${Date.now()}`,
    ticketId,
    userId,
    content,
    createdAt: new Date().toISOString(),
  };

  // Ajouter le moduleTicket à la liste existante
  moduleTickets.push(newModuleTicket);

  // Ajouter le module dans la conversation du ticket (remontée dans le fil de messages)
  const moduleMessage = {
    messageId: `msg_${Date.now()}`,
    userId, // Le userId qui a ajouté ce module
    content: `Module ajouté: ${content}`, // Format du message avec contenu du moduleTicket
    createdAt: new Date().toISOString()
  };

  // Ajouter le message dans la conversation du ticket
  addMessageToTicket(ticketId, userId, moduleMessage.content);

  // Écrire les mises à jour dans les fichiers JSON
  writeJsonFile(MODULE_TICKETS_FILE, moduleTickets);
  writeJsonFile(MESSAGES_FILE, messages); // Sauvegarder la liste des messages après l'ajout

  // Retourner le moduleTicket créé et le message ajouté à la conversation
  res.status(201).json({
    newModuleTicket,
    moduleMessage
  });
});



app.put('/api/messages/:ticketId/:messageId', (req, res) => {
  const { ticketId, messageId } = req.params;
  const { content } = req.body;

  if (!ticketId || !messageId || !content) {
    return res.status(400).json({ message: 'TicketId, MessageId, et contenu sont requis.' });
  }

  // Charger les messages depuis messages.json
  let messagesData = readJsonFile(MESSAGES_FILE);
  const ticket = messagesData.find(ticket => ticket.ticketId === ticketId);

  if (!ticket) {
    return res.status(404).json({ message: 'Ticket non trouvé.' });
  }

  // Chercher le message à mettre à jour
  const messageToUpdate = ticket.messages.find(msg => msg.messageId === messageId);

  if (!messageToUpdate) {
    return res.status(404).json({ message: 'Message non trouvé.' });
  }

  // Concaténer l'ancien contenu avec le nouveau
  messageToUpdate.content = `${messageToUpdate.content} ${content}`; // Ajoute le nouveau contenu à l'ancien
  messageToUpdate.updatedAt = new Date().toISOString();

  // Sauvegarder la mise à jour dans messages.json
  writeJsonFile(MESSAGES_FILE, messagesData);

  // Charger les modules depuis moduleTickets.json
  let moduleTicketsData = readJsonFile(MODULE_TICKETS_FILE);

  // Chercher le module correspondant au ticketId et messageId dans moduleTickets.json
  const moduleToUpdate = moduleTicketsData.find(module => module.ticketId === ticketId && module.id === messageId);

  if (moduleToUpdate) {
    // Concaténer l'ancien contenu avec le nouveau dans moduleTickets.json
    moduleToUpdate.content = `${moduleToUpdate.content} ${content}`; // Ajoute le nouveau contenu à l'ancien contenu
    moduleToUpdate.updatedAt = new Date().toISOString();

    // Sauvegarder la mise à jour dans moduleTickets.json
    writeJsonFile(MODULE_TICKETS_FILE, moduleTicketsData);
  } else {
    console.log(`Module non trouvé pour le ticketId: ${ticketId} et messageId: ${messageId}`);
  }

  // Retourner la réponse avec le message mis à jour
  res.status(200).json({ message: 'Message et module mis à jour avec succès.', updatedMessage: messageToUpdate });
});

app.get('/api/moduleTicket/:ticketId/:messageId', (req, res) => {
  const { ticketId, messageId } = req.params;

  // Lire le fichier messages.json
  const messagesData = readJsonFile(MESSAGES_FILE);

  // Trouver le ticket par ticketId
  const ticket = messagesData.find(ticket => ticket.ticketId === ticketId);

  if (!ticket) {
    return res.status(404).json({ message: 'Ticket non trouvé.' });
  }

  // Trouver le message par messageId
  const message = ticket.messages.find(msg => msg.messageId === messageId);

  if (!message) {
    return res.status(404).json({ message: 'Message non trouvé.' });
  }

  // Retourner le contenu du message
  res.status(200).json({ content: message.content });
});

// Route pour récupérer les tickets en fonction de companyName
app.get('/api/companies/:companyName/tickets', (req, res) => {
  const { companyName } = req.params;

  // Lire les tickets depuis tickets.json
  const ticketsPath = path.join(__dirname, 'json', 'tickets.json');
  const tickets = readJsonFile(ticketsPath);

  // Lire les données de projectManagement.json pour vérifier le companyName
  const projectManagementPath = path.join(__dirname, 'json', 'projectmanagement.json');
  const companies = readJsonFile(projectManagementPath);

  // Vérifier si le companyName existe dans projectManagement.json
  const companyExists = companies.some(company => company.companyName === companyName);
  if (!companyExists) {
    return res.status(404).json({ message: 'Entreprise non trouvée' });
  }

  // Filtrer les tickets pour ne garder que ceux dont l'organisation correspond au companyName
  const filteredTickets = tickets.filter(ticket => ticket.organization === companyName);

  // Retourner les tickets filtrés
  res.status(200).json(filteredTickets);
});

// Route pour ajouter un module sélectionné au ticket et dans les messages
app.post('/api/tickets/:ticketId/selectedModule', (req, res) => {
  const { ticketId } = req.params;
  const { moduleId } = req.body;

  // Lire le fichier JSON des tickets
  const tickets = readJsonFile(TICKETS2_FILE);
  // Lire le fichier JSON des messages
  const messages = readJsonFile(MESSAGES_FILE);

  // Trouver le ticket correspondant
  const ticket = tickets.find(t => t.id === ticketId);

  // Vérifier si le ticket existe
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket non trouvé.' });
  }

  // Ajouter l'ID du module sélectionné au ticket
  ticket.selectedModule = moduleId;

  // Trouver les messages associés au ticket
  const ticketMessages = messages.filter(msg => msg.ticketId === ticketId);

  // Ajouter l'ID du module sélectionné dans chaque message associé au ticket
  ticketMessages.forEach(msg => {
    msg.selectedModule = moduleId;
  });

  // Écrire les modifications dans les fichiers JSON des tickets et des messages
  writeJsonFile(TICKETS2_FILE, tickets);
  writeJsonFile(MESSAGES_FILE, messages);

  res.status(200).json({ message: 'Module sélectionné ajouté au ticket et aux messages avec succès', ticket });
});

// Charger les fichiers JSON
const ticketsFile = path.join(__dirname, 'json', 'tickets.json');
const modulesFile = path.join(__dirname, 'json', 'moduleTickets.json');
const synonymsFile = path.join(__dirname, 'json', 'synonymes.json');

// Charger les données
const ticketsData = readJsonFile(ticketsFile);
const moduleTicketsData = readJsonFile(modulesFile);
const synonymsData = readJsonFile(synonymsFile);


// Chemins vers les fichiers JSON
const ticketsPath = path.join(__dirname, 'json', 'tickets.json');
const modulesPath = path.join(__dirname, 'json', 'modules.json');
const moduleTicketsPath = path.join(__dirname, 'json', 'moduleTickets.json');

app.get('/api/compare/:ticketId', (req, res) => {
  const fs = require('fs');
  const { distance } = require('fastest-levenshtein');

  // Fonction pour nettoyer le texte (supprime les balises HTML et espaces inutiles)
  const cleanText = (text) => {
    return text
      .replace(/<[^>]*>/g, '') // Supprime les balises HTML
      .replace(/\s+/g, ' ') // Remplace les espaces multiples par un seul
      .trim(); // Supprime les espaces inutiles
  };

  // Fonction pour calculer la similarité avec Levenshtein
  const calculateSimilarity = (text1, text2) => {
    if (!text1 || !text2) {
      console.error("❌ Erreur: l'un des textes est undefined ou vide.", { text1, text2 });
      return 0;
    }

    text1 = cleanText(text1);
    text2 = cleanText(text2);

    const dist = distance(text1, text2);
    const maxLength = Math.max(text1.length, text2.length);
    return maxLength === 0 ? 0 : ((maxLength - dist) / maxLength) * 100;
  };

  try {
    const ticketId = req.params.ticketId;
    const ticketsData = JSON.parse(fs.readFileSync(ticketsPath, 'utf8'));
    const modulesData = JSON.parse(fs.readFileSync(modulesPath, 'utf8'));
    const moduleTicketsData = JSON.parse(fs.readFileSync(moduleTicketsPath, 'utf8'));

    // Trouver le ticket correspondant
    const ticket = ticketsData.find(t => t.id === ticketId);
    if (!ticket) {
      return res.status(404).json({ error: '❌ Ticket non trouvé' });
    }

    let ticketDetail = ticket.detail?.trim();
    if (!ticketDetail || typeof ticketDetail !== 'string') {
      console.error("❌ Erreur: `ticketDetail` est invalide.", { ticketDetail });
      return res.status(400).json({ error: 'Le détail du ticket est invalide' });
    }

    ticketDetail = cleanText(ticketDetail); // Nettoyage du texte du ticket
    const similarityThreshold = 10; // 🔽 TEST : Baisser à 50% pour voir si on trouve des résultats

    console.log("🎯 Détail du Ticket:", ticketDetail);

    // Comparer avec modules.json
    const matchingModules = modulesData.flatMap(module => 
      module.courses
        .map(course => {
          if (!course.content || typeof course.content !== 'string' || course.content.trim() === "") {
            console.warn(`⚠️ Ignoré: Pas de content pour [${course.title}]`);
            return null;
          }

          const cleanCourseContent = cleanText(course.content);
          const similarity = calculateSimilarity(ticketDetail, cleanCourseContent);
          console.log(`🔍 Similarité trouvée avec ${course.title}: ${similarity}%`);

          return similarity >= similarityThreshold ? { ...course, similarity } : null;
        })
        .filter(course => course !== null)
    );

    // Comparer avec moduleTickets.json
    const matchingModuleTickets = moduleTicketsData
      .map(moduleTicket => {
        if (!moduleTicket.content || typeof moduleTicket.content !== 'string' || moduleTicket.content.trim() === "") {
          console.warn(`⚠️ Ignoré: Pas de content pour [ModuleTicket]`);
          return null;
        }

        const cleanModuleTicketContent = cleanText(moduleTicket.content);
        const similarity = calculateSimilarity(ticketDetail, cleanModuleTicketContent);
        console.log(`🔍 Similarité trouvée avec ModuleTicket: ${similarity}%`);

        return similarity >= similarityThreshold ? { ...moduleTicket, similarity } : null;
      })
      .filter(moduleTicket => moduleTicket !== null);

    // Fusionner et trier les résultats (Top 3)
    const sortedResults = [...matchingModules, ...matchingModuleTickets]
      .sort((a, b) => b.similarity - a.similarity) // Tri décroissant
      .slice(0, 3); // Garde les 3 meilleurs

    const results = { matchingModules: sortedResults };

    console.log("📌 Résultats envoyés:", results);
    res.json(results);
  } catch (error) {
    console.error('❌ Erreur interne lors de la comparaison :', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});


// Gestion de porjet 

const DATA_FILE = path.join(__dirname, 'json', 'datacompanies.json');
// Endpoint pour initialiser la hiérarchie : compagnie, programme et projet
app.post('/initialize', (req, res) => {
  const { companyId, companyName, programId, programName, projectId, projectName } = req.body;
  console.log("Initialisation reçue :", req.body);

  let data;
  try {
    let rawData = '';
    if (fs.existsSync(DATA_FILE)) {
      rawData = fs.readFileSync(DATA_FILE, 'utf8');
    }
    if (!rawData.trim()) {
      rawData = '{"companies": []}';
    }
    data = JSON.parse(rawData);
  } catch (error) {
    console.error("Erreur lors de la lecture du fichier JSON :", error);
    return res.status(500).json({ error: "Erreur lors de la lecture des données." });
  }

  if (!data.companies) data.companies = [];

  // Créer ou récupérer la compagnie
  let company = data.companies.find(c => c.id === companyId);
  if (!company) {
    company = {
      id: companyId,
      companyName: companyName || "Nom de compagnie inconnu",
      programs: []
    };
    data.companies.push(company);
    console.log(`Compagnie ${companyId} créée.`);
  } else {
    console.log(`Compagnie ${companyId} trouvée.`);
  }

  // Créer ou récupérer le programme
  let program = company.programs.find(p => p.programId === programId);
  if (!program) {
    program = {
      programId: programId,
      programName: programName || "Programme inconnu",
      projects: []
    };
    company.programs.push(program);
    console.log(`Programme ${programId} créé.`);
  } else {
    console.log(`Programme ${programId} trouvé.`);
  }

  // Créer ou récupérer le projet
  let project = program.projects.find(p => p.id === projectId);
  if (!project) {
    project = {
      id: projectId,
      projectName: projectName || "Projet inconnu",
      tabs: []
    };
    program.projects.push(project);
    console.log(`Projet ${projectId} créé.`);
  } else {
    console.log(`Projet ${projectId} trouvé.`);
  }

  // Sauvegarder les données
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return res.status(201).json({ message: "Initialisation réussie", data });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des données :", error);
    return res.status(500).json({ error: "Erreur lors de la sauvegarde des données." });
  }
});



app.post('/projects/:projectId/tabs', (req, res) => {
  const { projectId } = req.params;
  // Pour créer la hiérarchie, on attend aussi companyId, companyName, programId et programName dans le body
  const { companyId, companyName, programId, programName, tabId, tabName } = req.body;
  
  console.log("Requête reçue :", req.body);
  
  // Lire ou initialiser le fichier JSON
  let data;
  try {
    let rawData = '';
    if (fs.existsSync(DATA_FILE)) {
      rawData = fs.readFileSync(DATA_FILE, 'utf8');
    }
    if (!rawData.trim()) {
      rawData = '{"companies": []}';
    }
    data = JSON.parse(rawData);
  } catch (error) {
    console.error("Erreur lors de la lecture du fichier JSON :", error);
    return res.status(500).json({ error: "Erreur lors de la lecture des données." });
  }
  
  // Assurez-vous que data.companies existe
  if (!data.companies) {
    data.companies = [];
  }
  
  // Vérifier ou créer la compagnie
  let company = data.companies.find(c => c.id === companyId);
  if (!company) {
    console.log(`Création de la compagnie ${companyId}`);
    company = {
      id: companyId,
      companyName: companyName || "Nom de compagnie inconnu",
      programs: []
    };
    data.companies.push(company);
  } else {
    console.log(`Compagnie trouvée : ${company.companyName}`);
  }
  
  // Vérifier ou créer le programme
  let program = company.programs.find(p => p.programId === programId);
  if (!program) {
    console.log(`Création du programme ${programId}`);
    program = {
      programId: programId,
      programName: programName || "Programme inconnu",
      projects: []
    };
    company.programs.push(program);
  } else {
    console.log(`Programme trouvé : ${program.programName}`);
  }
  
  // Vérifier ou créer le projet
  let project = program.projects.find(p => p.id === projectId);
  if (!project) {
    console.log(`Création du projet ${projectId}`);
    project = {
      id: projectId,
      projectName: "Projet inconnu",
      tabs: []
    };
    program.projects.push(project);
  } else {
    console.log(`Projet trouvé : ${project.projectName}`);
  }
  
  // Ajouter la tab
  if (!project.tabs) {
    project.tabs = [];
  }
  const existingTab = project.tabs.find(tab => tab.tabId === tabId);
  if (existingTab) {
    console.error(`Une tab avec l'ID ${tabId} existe déjà.`);
    return res.status(400).json({ error: "Une tab avec cet ID existe déjà." });
  }
  
  const newTab = { tabId, tabName, rows: [] };
  project.tabs.push(newTab);
  console.log(`Tab ajoutée : ${tabName}`);
  
  // Sauvegarder les données dans le fichier JSON
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log("Fichier JSON mis à jour avec succès.");
    return res.status(201).json({ message: "Tab ajoutée avec succès.", tab: newTab });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des données :", error);
    return res.status(500).json({ error: "Erreur lors de la sauvegarde des données." });
  }
});

app.get('/projects/:projectId/tabs', (req, res) => {
  const { projectId } = req.params;
  const { companyId, programId } = req.query; // Ces données peuvent être passées en tant que query params

  console.log(`Requête reçue pour récupérer les tabs du projet : ${projectId}`);

  let data;
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    console.log(`Fichier JSON chargé avec succès.`);
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors du chargement des données.' });
  }

  // Recherche de la compagnie
  const company = data.companies.find((c) => c.id === companyId);
  if (!company) {
    console.error(`Compagnie avec l'ID ${companyId} introuvable.`);
    return res.status(404).json({ error: 'Compagnie non trouvée.' });
  }

  // Recherche du programme
  const program = company.programs.find((p) => p.programId === programId);
  if (!program) {
    console.error(`Programme avec l'ID ${programId} introuvable.`);
    return res.status(404).json({ error: 'Programme non trouvé.' });
  }

  // Recherche du projet
  const project = program.projects.find((p) => p.id === projectId);
  if (!project) {
    console.error(`Projet avec l'ID ${projectId} introuvable.`);
    return res.status(404).json({ error: 'Projet non trouvé.' });
  }

  // Retourner les tabs ou un tableau vide
  res.status(200).json({ tabs: project.tabs || [] });
});

// Charger les données du fichier JSON
const loadData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erreur lors du chargement des données :', err);
    return [];
  }
};

// Sauvegarder les données dans le fichier JSON
const saveData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Erreur lors de la sauvegarde des données :', err);
  }
};
app.post('/tabs/:tabId/rows', (req, res) => {
  const { tabId } = req.params;
  const { companyId, programId, projectId, rowId, rowName, owner, goal, priority, type, budget, actual, status } = req.body;

  console.log('Données reçues côté serveur:', req.body);

  // Charger les données existantes
  const data = loadData();
  console.log('Données chargées:', data);  // Vérifiez si les données sont chargées correctement

  // Vérifier la présence de la compagnie
  const company = data.companies.find(c => c.id === companyId);
  if (!company) {
    console.log(`Compagnie introuvable pour companyId: ${companyId}`);
    return res.status(404).json({ error: 'Compagnie introuvable.' });
  }

  // Vérifier la présence du programme
  const program = company.programs.find(p => p.programId === programId);
  if (!program) {
    console.log(`Programme introuvable pour programId: ${programId}`);
    return res.status(404).json({ error: 'Programme introuvable.' });
  }

  // Vérifier la présence du projet
  const project = program.projects.find(proj => proj.id === projectId);
  if (!project) {
    console.log(`Projet introuvable pour projectId: ${projectId}`);
    return res.status(404).json({ error: 'Projet introuvable.' });
  }

  // Vérifier la présence de la tab
  const tab = project.tabs.find(t => t.tabId === tabId);
  if (!tab) {
    console.log(`Tab introuvable pour tabId: ${tabId}`);
    return res.status(404).json({ error: 'Tab introuvable.' });
  }

  // Calculer le budget restant
  const remainingBudget = budget - actual;


  // Créer la nouvelle row
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

  try {
    saveData(data); // Sauvegarder les données modifiées
    return res.status(201).json({ message: 'Row ajoutée avec succès.', row: newRow });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des données:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'ajout de la row.' });
  }
});

app.get('/tabs/:tabId/rows', (req, res) => {
  const { tabId } = req.params;
  const { companyId, programId, projectId } = req.query;

  console.log('Requête reçue avec les paramètres:', req.query);

  // Charger les données
  const data = loadData();
  console.log('Données chargées:', data);

  // Vérifier si "data" est bien un tableau
  if (!Array.isArray(data.companies)) {
    console.error('Les données chargées ne sont pas un tableau de compagnies.');
    return res.status(500).json({ error: 'Les données chargées ne sont pas un tableau.' });
  }

  // Recherche de la compagnie dans les données
  const company = data.companies.find((c) => c.id === companyId);
  if (!company) return res.status(404).json({ error: 'Compagnie introuvable.' });

  // Recherche du programme
  const program = company.programs.find((p) => p.programId === programId);
  if (!program) return res.status(404).json({ error: 'Programme introuvable.' });

  // Recherche du projet
  const project = program.projects.find((proj) => proj.id === projectId);
  if (!project) return res.status(404).json({ error: 'Projet introuvable.' });

  // Recherche de la tab
  const tab = project.tabs.find((t) => t.tabId === tabId);
  if (!tab) return res.status(404).json({ error: 'Tab introuvable.' });

  console.log('Tab trouvé:', tab);
  return res.status(200).json({ rows: tab.rows || [] });
});

app.put('/tabs/:tabId/rows/:rowId', (req, res) => {
  const { tabId, rowId } = req.params;
  const { status } = req.body;

  // Charger les données
  const data = loadData();

  // Recherche de la tab
  const company = data.companies.find((c) => c.id === req.body.companyId);
  const program = company.programs.find((p) => p.programId === req.body.programId);
  const project = program.projects.find((proj) => proj.id === req.body.projectId);
  const tab = project.tabs.find((t) => t.tabId === tabId);

  if (!tab) {
    return res.status(404).json({ error: 'Tab introuvable.' });
  }

  // Trouver la row et la mettre à jour
  const row = tab.rows.find((r) => r.rowId === rowId);
  if (!row) {
    return res.status(404).json({ error: 'Row introuvable.' });
  }

  row.status = status;  // Mise à jour du statut

  // Sauvegarder les données modifiées
  try {
    saveData(data);  // Assurez-vous que cette fonction fonctionne correctement pour sauvegarder les données
    res.status(200).json({ message: 'Statut mis à jour avec succès.', row });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des données:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut.' });
  }
});

// Fonction pour lire le fichier JSON
const readDataFile = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
};

// Fonction pour écrire dans le fichier JSON
const writeDataFile = (data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
app.post('/projects/:projectId/functional', (req, res) => {
  const { projectId } = req.params;
  const { rowId, name, estimatedGain, projectType, resourcesRequired, startDate, endDate, status } = req.body;

  // Charger les données à partir du fichier JSON
  const data = JSON.parse(fs.readFileSync('./datacompanies.json'));

  // Trouver le projet correspondant dans la structure de données
  const project = findProjectById(data, projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // Trouver la ligne (row) spécifique où ajouter le projet fonctionnel
  const row = findRowById(project, rowId);
  if (!row) {
    return res.status(404).json({ error: 'Row not found' });
  }

  // Créer le projet fonctionnel
  const functionalProject = {
    name,
    estimatedGain,
    projectType,
    resourcesRequired,
    startDate,
    endDate,
    status,
  };

  // Ajouter le projet fonctionnel à la ligne (row)
  if (!row.functionalProjects) {
    row.functionalProjects = [];  // Initialiser si ce n'est pas déjà fait
  }
  row.functionalProjects.push(functionalProject);  // Ajouter le projet fonctionnel à la ligne

  // Sauvegarder les données mises à jour dans le fichier JSON
  fs.writeFileSync('./datacompanies.json', JSON.stringify(data, null, 2));

  res.status(201).json(functionalProject); // Répondre avec le projet fonctionnel ajouté
});

// Fonction pour rechercher le projet par ID
function findProjectById(data, projectId) {
  for (const company of data.companies) {
    for (const program of company.programs) {
      for (const project of program.projects) {
        if (project.id === projectId) {
          return project;
        }
      }
    }
  }
  return null;
}

// Fonction pour rechercher la ligne par ID dans un projet
function findRowById(project, rowId) {
  for (const tab of project.tabs) {
    for (const row of tab.rows) {
      if (row.rowId === rowId) {
        return row;
      }
    }
  }
  return null;
}






app.get('/projects/:projectId/functional/:rowId', async (req, res) => {
  const { projectId, rowId } = req.params;

  try {
    // Lire les données depuis le fichier JSON
    const data = await readDataFile();
    
    // Recherche du projet et de la ligne correspondante
    let functionalProjects = [];
    for (let company of data.companies) {
      for (let program of company.programs) {
        for (let project of program.projects) {
          if (project.id === projectId) {
            for (let tab of project.tabs) {
              for (let row of tab.rows) {
                if (row.rowId === rowId) {
                  // Récupérer tous les projets fonctionnels associés à cette ligne
                  functionalProjects = row.functionalProjects || []; 
                  break;
                }
              }
            }
          }
        }
      }
    }

    if (functionalProjects.length > 0) {
      res.status(200).json({ functionalProjects });
    } else {
      res.status(404).json({ message: 'Aucun projet fonctionnel trouvé pour cette ligne.' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des projets fonctionnels:', error);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
});

// Db enrichment tickets


// 📂 Chemins des fichiers JSON
const DB_ENTRY_TICKET_PATH = path.join(__dirname, 'json', 'dbEntryTickets.json');
const DB_MESSAGES_PATH = path.join(__dirname, 'json', 'messages.json');
const DB_TICKETS_PATH = path.join(__dirname, 'json', 'tickets.json');

// ✅ Fonction pour lire un fichier JSON
const readJSONFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (error) {
    console.error(`❌ Erreur de lecture du fichier JSON (${filePath}):`, error);
    return {};
  }
};

// ✅ Fonction pour lire la DB des tickets enrichis
const readEntryTicketsDB = () => {
  try {
    if (!fs.existsSync(DB_ENTRY_TICKET_PATH)) {
      return { positif: [], neutre: [], negatif: [] };
    }
    const rawData = fs.readFileSync(DB_ENTRY_TICKET_PATH, "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error("❌ Erreur lecture DB:", error);
    return { positif: [], neutre: [], negatif: [] };
  }
};

// ✅ Fonction pour écrire dans la DB des tickets enrichis
const writeEntryTicketsDB = (data) => {
  try {
    fs.writeFileSync(DB_ENTRY_TICKET_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("❌ Erreur écriture DB:", error);
  }
};

// ✅ Fonction pour calculer la similarité entre deux textes
const calculateSimilarity = (text1, text2) => {
  const tokenizer = new natural.WordTokenizer();
  const tokens1 = tokenizer.tokenize(text1.toLowerCase());
  const tokens2 = tokenizer.tokenize(text2.toLowerCase());

  const intersection = tokens1.filter(word => tokens2.includes(word)).length;
  const union = new Set([...tokens1, ...tokens2]).size;

  return union === 0 ? 0 : (intersection / union);
};

// ✅ Route unique pour gérer les tickets d’enrichissement
app.route("/api/enrich-db")
  // 📌 GET : Récupérer tous les tickets d’enrichissement
  .get((req, res) => {
    const tickets = readEntryTicketsDB();
    res.json(tickets);
  })
  // 📌 POST : Ajouter un nouveau ticket d’enrichissement
  .post((req, res) => {
    const { text, category } = req.body;

    if (!text || !category) {
      return res.status(400).json({ success: false, message: "❌ Données manquantes" });
    }

    const dbData = readEntryTicketsDB();

    if (!dbData[category]) {
      return res.status(400).json({ success: false, message: "❌ Catégorie invalide" });
    }

    // Ajouter le ticket avec la date
    dbData[category].push({ text, date: new Date().toISOString() });

    // Sauvegarder la nouvelle DB
    writeEntryTicketsDB(dbData);

    res.json({ success: true, message: "✅ Ticket ajouté avec succès !" });
  });

// 📌 GET : Récupérer les tickets d'une catégorie spécifique
app.get("/api/enrich-db/:category", (req, res) => {
  const category = req.params.category;
  const dbData = readEntryTicketsDB();

  if (!dbData[category]) {
    return res.status(400).json({ success: false, message: "❌ Catégorie invalide" });
  }

  res.json(dbData[category]);
});

app.post("/api/project-meteo/:ticketId", (req, res) => {
  const ticketId = req.params.ticketId;

  // 🔹 Charger les données
  const tickets = readJSONFile(DB_TICKETS_PATH);
  const dbEntries = readJSONFile(DB_ENTRY_TICKET_PATH);
  const allMessages = readJSONFile(DB_MESSAGES_PATH);

  console.log("📌 Ticket ID reçu pour mise à jour météo:", ticketId);

  // 🔹 Trouver le ticket correspondant
  const ticketIndex = tickets.findIndex(t => t.id === ticketId);

  if (ticketIndex === -1) {
    console.error("❌ Ticket non trouvé:", ticketId);
    return res.status(404).json({ success: false, message: "❌ Ticket non trouvé." });
  }

  const ticket = tickets[ticketIndex];
  const ticketCreatorId = ticket.userId;
  console.log("✅ Créateur du ticket:", ticketCreatorId);

  // 🔹 Récupérer les messages du ticket
  const ticketMessages = allMessages.find(t => t.ticketId === ticketId);
  console.log("📌 Messages du ticket récupérés:", ticketMessages);

  if (!ticketMessages || !Array.isArray(ticketMessages.messages)) {
    console.error("❌ Aucun message trouvé pour ce ticket.");
    return res.status(404).json({ success: false, message: "❌ Aucun message trouvé pour ce ticket." });
  }

  // 🔹 Filtrer uniquement les messages du créateur du ticket
  const creatorMessages = ticketMessages.messages.filter(msg => msg.userId === ticketCreatorId);
  console.log("📌 Messages du créateur du ticket:", creatorMessages.length);

  if (creatorMessages.length === 0) {
    console.error("❌ Aucun message du créateur trouvé.");
    return res.status(404).json({ success: false, message: "❌ Aucun message du créateur trouvé." });
  }

  let similarityScores = { positif: 0, neutre: 0, negatif: 0 };
  let totalComparisons = 0;

  // 🔹 Comparer chaque message du créateur avec la DB météo
  creatorMessages.forEach((message) => {
    Object.keys(dbEntries).forEach((category) => {
      dbEntries[category].forEach((entry) => {
        const similarity = calculateSimilarity(message.content.toLowerCase(), entry.text.toLowerCase());
        console.log(`🔍 Comparaison : "${message.content}" avec "${entry.text}" → Score: ${similarity}`);
        if (similarity > 0.5) { 
          similarityScores[category] += similarity;
          totalComparisons++;
        }
      });
    });
  });

  console.log("📊 Résultat des similarités:", similarityScores);

  // 🔹 Déterminer la météo finale du ticket
  if (totalComparisons === 0) {
    ticket.meteo = "🌤 Indéterminée";
  } else {
    const dominantCategory = Object.keys(similarityScores).reduce((a, b) =>
      similarityScores[a] > similarityScores[b] ? a : b
    );

    switch (dominantCategory) {
      case "positif":
        ticket.meteo = "☀️ Positive";
        break;
      case "neutre":
        ticket.meteo = "🌤 Neutre";
        break;
      case "negatif":
        ticket.meteo = "🌧 Négative";
        break;
      default:
        ticket.meteo = "🌤 Indéterminée";
    }
  }

  console.log(`✅ Météo calculée pour ${ticketId}: ${ticket.meteo}`);

  // 🔹 Mise à jour de `tickets.json`
  try {
    fs.writeFileSync(DB_TICKETS_PATH, JSON.stringify(tickets, null, 2), "utf-8");
    console.log(`✅ Météo ajoutée au ticket ${ticketId}: ${ticket.meteo}`);
    return res.json({ success: true, meteo: ticket.meteo });
  } catch (error) {
    console.error("❌ Erreur d'écriture dans tickets.json:", error);
    return res.status(500).json({ success: false, message: "❌ Erreur lors de la mise à jour de la météo." });
  }
});




// 📌 Route pour récupérer la météo du projet (analyse des messages du créateur du ticket)
app.get("/api/project-meteo/:ticketId", (req, res) => {
  const ticketId = req.params.ticketId;

  // 🔹 Charger les données
  const tickets = readJSONFile(DB_TICKETS_PATH);
  const dbEntries = readJSONFile(DB_ENTRY_TICKET_PATH);
  const allMessages = readJSONFile(DB_MESSAGES_PATH);

  console.log("📌 Ticket ID reçu:", ticketId);

  // 🔹 Trouver le ticket correspondant
  const ticket = tickets.find(t => t.id === ticketId);
  
  if (!ticket) {
    console.error("❌ Ticket non trouvé:", ticketId);
    return res.status(404).json({ success: false, message: "❌ Ticket non trouvé." });
  }



  const ticketCreatorId = ticket.userId; 
  console.log("✅ Créateur du ticket:", ticketCreatorId);

  // 🔹 Récupérer les messages du ticket
  const ticketMessages = allMessages.find(t => t.ticketId === ticketId);
  console.log("📌 Messages du ticket récupérés:", ticketMessages);

  if (!ticketMessages || !Array.isArray(ticketMessages.messages)) {
    console.error("❌ Aucun message trouvé pour ce ticket ou `messages` n'est pas un tableau.");
    return res.status(404).json({ success: false, message: "❌ Aucun message trouvé pour ce ticket." });
  }

  console.log("📌 Nombre total de messages du ticket:", ticketMessages.messages.length);
  
  // ✅ Filtrer uniquement les messages du créateur du ticket
  const creatorMessages = ticketMessages.messages.filter(msg => msg.userId === ticketCreatorId);
  
  console.log("📌 Messages écrits par le créateur:", creatorMessages.length);
  
  if (creatorMessages.length === 0) {
    console.error("❌ Aucun message du créateur trouvé pour ce ticket.");
    return res.status(404).json({ success: false, message: "❌ Aucun message du créateur trouvé pour ce ticket." });
  }

  let similarityScores = { positif: 0, neutre: 0, negatif: 0 };
  let totalComparisons = 0;

  // 🔹 Comparer chaque message du créateur avec la DB météo
  creatorMessages.forEach((message) => {
    Object.keys(dbEntries).forEach((category) => {
      dbEntries[category].forEach((entry) => {
        // Vérification avec includes() au lieu de calculateSimilarity()
        if (message.content.toLowerCase().includes(entry.text.toLowerCase())) {
          console.log(`✅ Correspondance trouvée : "${message.content}" → "${entry.text}"`);
          similarityScores[category]++;
          totalComparisons++;
        }
      });
    });
  });
  console.log("📊 Résultat des similarités APRES traitement:", similarityScores);
console.log("🔢 Nombre total de comparaisons:", totalComparisons);

  if (totalComparisons === 0) {
    return res.json({ meteo: "🌤 Indéterminée", details: similarityScores });
  }

  // 🔹 Déterminer la météo en fonction des similarités
  const dominantCategory = Object.keys(similarityScores).reduce((a, b) =>
    similarityScores[a] > similarityScores[b] ? a : b
  );




  let meteo;
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
    default:
      meteo = "🌤 Indéterminée";
  }

  console.log(`📌 Météo actuelle avant mise à jour: ${ticket.meteo}`);
  console.log(`✅ Nouvelle météo pour ${ticketId}: ${ticket.meteo}`);

  // 📌 ✅ Retourner la météo au frontend
  res.json({ meteo, details: similarityScores });
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


