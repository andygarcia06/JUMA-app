const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const router = express.Router();


const app = express();
const port = process.env.PORT || 3001;


const user = { id: 123, username: 'utilisateur' };
const token = jwt.sign(user, 'votreCléSecrète');

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../mon-app-client/build')));

// The "catchall" handler: for any request that doesn't
// // match one above, send back React's index.html file.
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname+'../mon-app-client/build/index.html'));
// });


// Middleware
app.use(cors());
app.use(bodyParser.json());


// Chemins des fichiers JSON
const filePathSignUp = path.join(__dirname, './json/connectDatas.json');
const ticketsFilePath = path.join(__dirname, './json/tickets.json');


// Lecture des fichiers JSON
let users = fs.existsSync(filePathSignUp) ? JSON.parse(fs.readFileSync(filePathSignUp, 'utf-8')) : [];

// Route de bienvenue
app.get('/', (req, res) => {
  res.send('Bienvenue sur le serveur Node.js !');
});



// Route de recherche
app.post('/recherche', (req, res) => {
  try {
    const searchTerm = req.body.searchTerm;
    const searchResults = data.filter((item) => item.contenu_article.includes(searchTerm));
    res.json(searchResults);
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Route d'ajout
app.post('/ajouter', (req, res) => {
  try {
    const { nom_article, contenu_article } = req.body;
    data.push({ nom_article, contenu_article });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.json({ message: 'Nouvelle entrée ajoutée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Route de connexion
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    const token = jwt.sign({ id: user.username }, 'votreCléSecrète', { expiresIn: '1h' });

    res.json({ 
      success: true, 
      message: 'Connexion réussie', 
      pseudo: user.pseudo, 
      userId: user.username, 
      role: 'utilisateur',
      token: token // Ajout du token dans la réponse
    });
  } else {
    res.status(401).json({ success: false, error: 'Identifiants incorrects' });
  }
});

app.post('/admin-login', (req, res) => {
  const { username, password } = req.body;
  console.log('Identifiants reçus - Username:', username, 'Password:', password);

  // Recherche de l'utilisateur dans la liste des utilisateurs
  const user = users.find(u => u.username === username && u.password === password);

  if (user && user.role === 'admin') {
    // Si les identifiants correspondent à un administrateur
    const token = jwt.sign({ id: user.username, role: 'admin' }, 'votreCléSecrète', { expiresIn: '1h' });

    res.json({
      success: true,
      message: 'Connexion admin réussie',
      pseudo: user.pseudo,
      userId: user.username,
      role: 'admin',
      token: token
    });
  } else {
    res.status(401).json({ success: false, error: 'Identifiants administrateur incorrects' });
    console.log('pas de connexion')
  }
});








// Route de SignUp avec attribution de rôle
app.post('/signup', (req, res) => {
  const { username, password, pseudo, email, phoneNumber, role } = req.body;
  // Ajoutez 'role' ici

  if (users.some(u => u.username === username)) {
    return res.status(400).json({ success: false, error: 'Nom d\'utilisateur déjà utilisé' });
  }

  const newUser = { username, password, pseudo, email, phoneNumber, role };
  users.push(newUser);
  fs.writeFileSync(filePathSignUp, JSON.stringify(users, null, 2));

  res.json({ success: true, message: 'Inscription réussie' });
});

// Middleware pour vérifier le token JWT et ajouter l'utilisateur à la requête
function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];
    req.token = bearerToken;

    jwt.verify(req.token, 'votreCléSecrète', (err, authData) => {
      if (err) {
        res.sendStatus(403); // Accès refusé en cas d'erreur de vérification
      } else {
        req.user = authData;
        next(); // Passez à la prochaine étape de la route
      }
    });
  } else {
    res.sendStatus(401); // Non autorisé si le token n'est pas fourni
  }
}


// Route pour la mise à jour du rôle d'un utilisateur
app.put('/update-role', (req, res) => {
  const { username, newRole } = req.body;
  const userIndex = users.findIndex(u => u.username === username);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'Utilisateur non trouvé' });
  }

  users[userIndex].role = newRole;
  fs.writeFileSync(filePathSignUp, JSON.stringify(users, null, 2));
  res.json({ success: true, message: 'Rôle mis à jour' });
});

// Routes pour les tickets...


// Route pour récupérer tous les utilisateurs
app.get('/api/get-users', (req, res) => {
  // Lecture du fichier connectDatas.json
  fs.readFile('./json/connectDatas.json', 'utf8', (err, data) => {
    if (err) {
      console.error("Erreur lors de la lecture du fichier", err);
      res.status(500).send("Erreur serveur lors de la récupération des utilisateurs");
    } else {
      const users = JSON.parse(data);
      res.json(users); // Envoie la liste des utilisateurs au client
    }
  });
});





// KNOWLEDGE MANAGEMENT
// Chemin du fichier JSON des modules
const MODULES_FILE = './json/modules.json';
let modules = []; // Initialisez modules comme un tableau vide

// Charger les données des modules au démarrage du serveur
fs.readFile(MODULES_FILE, 'utf8', (err, data) => {
  if (err) {
    console.error('Erreur lors de la lecture des modules :', err);
    return;
  }
  modules = JSON.parse(data); // Mettre à jour modules avec les données lues depuis le fichier
});

// Endpoint pour récupérer les modules
app.get('/api/modules', (req, res) => {
  console.log('Requête GET /api/modules reçue');
  res.json(modules); // Retourner les modules chargés au démarrage du serveur
});

// Endpoint pour récupérer les cours d'un module spécifique
app.get('/api/modules/:moduleId/courses', (req, res) => {
  const moduleId = req.params.moduleId;

  // Lecture des données des modules à chaque requête
  fs.readFile(MODULES_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erreur lors de la lecture des modules');
    }

    try {
      const modulesData = JSON.parse(data);
      const module = modulesData.find(module => module.id === moduleId);

      if (!module) {
        return res.status(404).json({ message: 'Module non trouvé.' });
      }

      // Renvoyer les cours du module
      res.json(module.courses);
    } catch (error) {
      console.error('Erreur lors de la récupération des cours du module :', error);
      res.status(500).json({ error: 'Erreur interne du serveur lors de la récupération des cours du module' });
    }
  });
});


// Endpoint pour créer un nouveau module
app.post('/api/modules', (req, res) => {
  console.log('Requête POST /api/modules reçue');

  const { title, createdAt, creator } = req.body;
  
  if (!title || !createdAt || !creator) {
    res.status(400).json({ message: 'Veuillez fournir un titre, une date de création et un créateur.' });
    return;
  }

  const newModule = {
    id: generateId(), // Générer un nouvel ID pour le module
    title,
    createdAt,
    creator,
    courses: []
  };

  modules.push(newModule); // Ajouter le nouveau module à la liste des modules

  // Enregistrer les modules mis à jour dans le fichier JSON
  fs.writeFile(MODULES_FILE, JSON.stringify(modules, null, 2), err => {
    if (err) {
      console.error(err);
      res.status(500).send('Erreur lors de l\'écriture du fichier des modules');
      return;
    }
    res.status(201).json(newModule);
  });
});

// Endpoint pour créer un nouveau cours
app.post('/api/courses', (req, res) => {
  console.log('Requête POST /api/courses reçue');
  console.log('Données de la requête:', req.body); // Affichez les données reçues du frontend

  // Récupérez les données de req.body
  const { title, moduleName, description, content, createdAt, creator } = req.body;
  
  // Assurez-vous que toutes les données requises sont présentes
  if (!title || !moduleName || !description || !content || !createdAt || !creator) { // Ajout de !content
    console.log('Données manquantes dans la requête');
    res.status(400).json({ message: 'Veuillez fournir un titre, un nom de module, une description, un contenu, une date de création et un créateur.' }); // Ajout de "un contenu"
    return;
  }

  fs.readFile(MODULES_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Erreur lors de la lecture des modules');
      return;
    }

    const modulesData = JSON.parse(data);
    const module = modulesData.find(module => module.id === moduleName); // Modifier ici pour rechercher par ID
    if (!module) {
      res.status(404).send('Module non trouvé');
      return;
    }

    // Vérifiez si un cours avec le même titre existe déjà dans le module
    const existingCourse = module.courses.find(course => course.title === title);
    if (existingCourse) {
      res.status(400).json({ message: 'Un cours avec le même titre existe déjà dans ce module' });
      return;
    }

    // Si aucun cours avec le même titre n'existe, créez le nouveau cours
    const newCourse = {
      id: generateId(), // Générer un nouvel ID pour le cours
      title,
      moduleName: module.title,
      description,
      content, // Ajout du contenu
      createdAt: new Date(),
      creator
    };

    module.courses.push(newCourse);

    fs.writeFile(MODULES_FILE, JSON.stringify(modulesData, null, 2), err => {
      if (err) {
        console.error(err);
        res.status(500).send('Erreur lors de l\'écriture du fichier des modules');
        return;
      }
      res.status(201).json(newCourse);
    });
  });
});

app.post('/api/log-course-view', (req, res) => {
  const { courseId, userId } = req.body;

  // Vérifier si courseId et userId sont fournis
  if (!courseId || !userId) {
    return res.status(400).send('CourseId et UserId sont requis.');
  }

  // Lire les données des utilisateurs depuis le fichier connectDatas.json
  fs.readFile('./json/connectDatas.json', 'utf8', (err, data) => {
    if (err) {
      console.error("Erreur lors de la lecture du fichier connectDatas.json :", err);
      return res.status(500).send("Erreur serveur lors de la lecture des données utilisateur.");
    }

    let connectDatas = JSON.parse(data);

    // Trouver l'entrée pour l'utilisateur avec l'identifiant correspondant
    const user = connectDatas.find(user => user.username === userId);

    if (user) {
      // Vérifier si l'utilisateur a déjà un tableau "courses"
      if (!user.courses) {
        user.courses = []; // Créer un nouveau tableau "courses" s'il n'existe pas
      }

      // Vérifier si le courseId n'existe pas déjà dans le tableau "courses"
      if (!user.courses.includes(courseId)) {
        // Ajouter le nouveau courseId à la liste des cours consultés par l'utilisateur
        user.courses.push(courseId);

        // Réécrire les données mises à jour dans le fichier JSON
        fs.writeFile('./json/connectDatas.json', JSON.stringify(connectDatas, null, 2), err => {
          if (err) {
            console.error("Erreur lors de l'écriture du fichier connectDatas.json :", err);
            return res.status(500).send("Erreur serveur lors de l'écriture des données utilisateur.");
          }
          res.send(`Identifiant du cours consulté ajouté avec succès à l'utilisateur ${userId}.`);
        });
      } else {
        res.status(400).send(`L'utilisateur ${userId} a déjà consulté ce cours.`);
      }
    } else {
      return res.status(404).send(`L'utilisateur ${userId} n'a pas été trouvé dans les données.`);
    }
  });
});

// ROutes pour récupéré les courses validés

app.get('/user/:userId', (req, res) => {
  const { userId } = req.params;

  // Lire le fichier JSON
  fs.readFile('./json/connectDatas.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Erreur lors de la lecture du fichier JSON :', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    try {
      // Convertir le contenu JSON en objet JavaScript
      const users = JSON.parse(data);

      // Rechercher l'utilisateur par userId
      const user = users.find(user => user.username === userId); // Assurez-vous que vous recherchez l'utilisateur par username, pas userId

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Afficher les informations de l'utilisateur dans la console
      console.log("Informations de l'utilisateur :", user);

      res.status(200).json(user);
    } catch (error) {
      console.error('Erreur lors de la conversion du JSON en objet JavaScript :', error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  });
});




// Route pour mettre à jour le nombre de modifications de l'utilisateur
app.post('/api/user/:userId/update-modification-count', async (req, res) => {
  const userId = req.params.userId;
  const modificationCount = req.body.modificationCount;

  try {
    // Lecture du contenu du fichier JSON
    let connectDatas = JSON.parse(fs.readFileSync('./json/connectDatas.json'));

    // Recherche de l'utilisateur dans le fichier JSON
    const userIndex = connectDatas.findIndex(user => user.username === userId);

    if (userIndex !== -1) {
      // Mise à jour du nombre de modifications de l'utilisateur
      connectDatas[userIndex].modificationCount += 1;
    } else {
      // Création d'une nouvelle entrée pour l'utilisateur
      connectDatas.push({
        username: userId,
        modificationCount: 1
      });
    }

    // Écriture du contenu mis à jour dans le fichier JSON
    fs.writeFileSync('./json/connectDatas.json', JSON.stringify(connectDatas, null, 2));

    console.log(`Nombre de modifications mis à jour pour l'utilisateur avec le username ${userId} : ${modificationCount}`);
    console.log('Contenu du fichier connectDatas.json après la mise à jour :', connectDatas); // Ajout du log pour afficher le contenu mis à jour
    res.status(200).send({ message: 'Nombre de modifications mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du nombre de modifications de l\'utilisateur :', error);
    res.status(500).send({ error: 'Une erreur est survenue lors de la mise à jour du nombre de modifications de l\'utilisateur' });
  }
});

// Route pour un ajouté les cours validé au user

const JSON_FILE_PATH = './json/connectDatas.json'; // Chemin vers le fichier JSON

// Route pour la validation d'un cours
router.post('/validated-course', async (req, res) => {
  try {
    const { courseId } = req.body;

    // Lisez le contenu actuel du fichier JSON
    let jsonData = await fs.readFile(JSON_FILE_PATH, 'utf-8');
    let data = JSON.parse(jsonData);

    // Vérifiez si le cours existe déjà dans le fichier JSON
    if (data.validatedCourses.includes(courseId)) {
      return res.status(400).json({ message: 'Ce cours a déjà été validé.' });
    }

    // Ajoutez l'ID du cours à la liste des cours validés
    data.validatedCourses.push(courseId);

    // Écrivez les données mises à jour dans le fichier JSON
    await fs.writeFile(JSON_FILE_PATH, JSON.stringify(data, null, 2));

    return res.status(200).json({ message: 'Cours validé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la validation du cours :', error);
    return res.status(500).json({ message: 'Une erreur est survenue lors de la validation du cours.' });
  }
});

// Route pour mettre à jour le nombre de réactions de l'utilisateur
app.post('/api/user/:userId/update-reaction-count', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Lire le contenu du fichier JSON ou charger depuis la base de données
    let reactionData = JSON.parse(fs.readFileSync('./json/connectDatas.json'));

    // Rechercher l'utilisateur dans le fichier JSON
    const userIndex = reactionData.findIndex(user => user.userId === userId);

    if (userIndex !== -1) {
      // Mise à jour du nombre de réactions de l'utilisateur
      reactionData[userIndex].reactionCount += 1;
    } else {
      // Créer une nouvelle entrée pour l'utilisateur
      reactionData.push({
        userId: userId,
        reactionCount: 1
      });
    }

    // Écrire le contenu mis à jour dans le fichier JSON ou sauvegarder dans la base de données
    fs.writeFileSync('./json/connectDatas.json', JSON.stringify(reactionData, null, 2));

    console.log(`Nombre de réactions mis à jour pour l'utilisateur avec l'ID ${userId}`);
    console.log('Contenu du fichier reactionData.json après la mise à jour :', reactionData);

    res.status(200).send({ message: 'Nombre de réactions mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du nombre de réactions de l\'utilisateur :', error);
    res.status(500).send({ error: 'Une erreur est survenue lors de la mise à jour du nombre de réactions de l\'utilisateur' });
  }
});





// Charger les données des modules à partir du fichier JSON
const modulesData = require('./json/modules.json');

// Route pour mettre à jour le contenu d'un cours
app.put('/courses/:courseId', (req, res) => {
  const courseId = req.params.courseId;
  const updatedContent = req.body.content;

  // Rechercher le module contenant le cours à mettre à jour
  let moduleToUpdate;
  let courseToUpdate;

  for (const module of modulesData) {
    courseToUpdate = module.courses.find(course => course.id === courseId);
    if (courseToUpdate) {
      moduleToUpdate = module;
      break;
    }
  }

  if (!moduleToUpdate || !courseToUpdate) {
    return res.status(404).json({ error: 'Le cours avec l\'ID spécifié n\'a pas été trouvé.' });
  }

  // Mettre à jour le contenu du cours avec le nouveau contenu
  courseToUpdate.content = updatedContent;

  // Enregistrer les modifications dans le fichier JSON
  fs.writeFile('./json/modules.json', JSON.stringify(modulesData, null, 2), err => {
    if (err) {
      console.error('Erreur lors de l\'enregistrement des modifications dans le fichier JSON :', err);
      return res.status(500).json({ error: 'Erreur lors de la mise à jour du contenu du cours.' });
    }
    console.log('Le contenu du cours a été mis à jour avec succès.');
    res.json({ message: 'Le contenu du cours a été mis à jour avec succès.' });
  });
});


app.put('/api/modules/:moduleId/courses/:courseId', (req, res) => {
  const moduleId = req.params.moduleId;
  const courseId = req.params.courseId;
  const updatedContent = req.body.content; // Contenu mis à jour du cours

  console.log("Module ID:", moduleId); // Ajout de cette console pour vérifier l'ID du module
  console.log("Course ID:", courseId); // Ajout de cette console pour vérifier l'ID du cours
  console.log("Updated Content:", updatedContent); // Ajout de cette console pour vérifier le contenu mis à jour

  // Rechercher le module dans la base de données en fonction de son ID
  const moduleIndex = modules.findIndex(module => module.id === moduleId);
  if (moduleIndex === -1) {
    console.error("Module not found");
    return res.status(404).json({ message: 'Module not found' });
  }

  // Rechercher le cours dans le module en fonction de son ID
  const courseIndex = modules[moduleIndex].courses.findIndex(course => course.id === courseId);
  if (courseIndex === -1) {
    console.error("Course not found");
    return res.status(404).json({ message: 'Course not found' });
  }

  // Mettre à jour le contenu du cours avec le contenu mis à jour
  modules[moduleIndex].courses[courseIndex].content = updatedContent;

  // Enregistrement des modifications dans la base de données
  fs.writeFile('./json/modules.json', JSON.stringify(modules, null, 2), (err) => {
    if (err) {
      console.error("Error writing to file:", err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    console.log("Data successfully updated");
    // Répondre avec les données mises à jour du cours
    res.json(modules[moduleIndex].courses[courseIndex]);
  });
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
    const modulesData = JSON.parse(fs.readFileSync('./json/modules.json', 'utf-8'));

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
app.post('/api/modules/:moduleId/courses/:courseId/reactions', (req, res) => {
  try {
    const { moduleId, courseId } = req.params;
    const { userId, reactionType } = req.body;

    // Charger les données depuis le fichier JSON
    let modulesData = JSON.parse(fs.readFileSync('./json/modules.json', 'utf-8'));

    // Trouver le module et le cours correspondants dans les données chargées
    const moduleIndex = modulesData.findIndex(module => module.id === moduleId);
    if (moduleIndex === -1) {
      return res.status(404).json({ message: 'Module non trouvé' });
    }

    const courseIndex = modulesData[moduleIndex].courses.findIndex(course => course.id === courseId);
    if (courseIndex === -1) {
      return res.status(404).json({ message: 'Cours non trouvé dans le module' });
    }

    // Ajouter la nouvelle réaction au cours spécifié
    modulesData[moduleIndex].courses[courseIndex].reactions.push({ userId, reactionType });

    // Enregistrer les modifications dans le fichier JSON
    fs.writeFileSync('./json/modules.json', JSON.stringify(modulesData, null, 2));

    // Ensuite, renvoyer une réponse indiquant que la réaction a été ajoutée avec succès
    res.status(201).json({ message: 'Réaction ajoutée avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la réaction :', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la réaction' });
  }
});

// Route pour mettre à jour une réaction dans un cours
app.put('/api/modules/:moduleId/courses/:courseId/reactions', (req, res) => {
  try {
    const { moduleId, courseId } = req.params;
    const { userId, reactionType, reactionStyle } = req.body;

    // Charger les données depuis le fichier JSON
    let modulesData = JSON.parse(fs.readFileSync('./json/modules.json', 'utf-8'));

    // Trouver le module correspondant
    const moduleIndex = modulesData.findIndex(module => module.id === moduleId);
    if (moduleIndex === -1) {
      return res.status(404).json({ message: 'Module non trouvé' });
    }

    // Trouver le cours correspondant dans le module
    const courseIndex = modulesData[moduleIndex].courses.findIndex(course => course.id === courseId);
    if (courseIndex === -1) {
      return res.status(404).json({ message: 'Cours non trouvé dans le module' });
    }

    // Mettre à jour ou écraser la réaction existante
    const reactionIndex = modulesData[moduleIndex].courses[courseIndex].reactions.findIndex(reaction => reaction.userId === userId);
    if (reactionIndex !== -1) {
      // Si la réaction existe déjà, mettre à jour le type et le style de réaction
      modulesData[moduleIndex].courses[courseIndex].reactions[reactionIndex].reactionType = reactionType;
      modulesData[moduleIndex].courses[courseIndex].reactions[reactionIndex].reactionStyle = reactionStyle;
      console.log('Réaction mise à jour pour l\'utilisateur', userId, ':', reactionType, '(', reactionStyle, ')');
    } else {
      // Si la réaction n'existe pas, ajouter une nouvelle réaction
      modulesData[moduleIndex].courses[courseIndex].reactions.push({ userId, reactionType, reactionStyle });
      console.log('Nouvelle réaction ajoutée pour l\'utilisateur', userId, ':', reactionType, '(', reactionStyle, ')');
    }

    // Enregistrer les modifications dans le fichier JSON
    fs.writeFileSync('./json/modules.json', JSON.stringify(modulesData, null, 2));

    // Répondre avec la mise à jour réussie
    res.json({ message: 'Réaction mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la réaction :', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la réaction' });
  }
});

// REWARD

app.get('/modules/creator/:userId', (req, res) => {
  const userId = req.params.userId;
  const modulesFilePath = path.join(__dirname, 'json', 'modules.json');

  // Lire le fichier JSON des modules
  fs.readFile(modulesFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Une erreur s'est produite lors de la lecture du fichier des modules." });
    }

    try {
      const modules = JSON.parse(data);

      // Filtrer les modules créés par l'utilisateur spécifié
      const userModules = modules.filter(module => module.creator.userId === userId);

      res.json(userModules); // Renvoyer les modules créés par l'utilisateur spécifié
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Une erreur s'est produite lors du traitement des données des modules." });
    }
  });
});

// Positive reactions
app.get('/user/:userId/positiveReactions', (req, res) => {
  const { userId } = req.params;
  
  // Chemin d'accès au fichier JSON des modules
  const modulesFilePath = path.join(__dirname, 'json', 'modules.json');

  // Lire le fichier JSON des modules
  fs.readFile(modulesFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Une erreur s'est produite lors de la lecture du fichier des modules." });
    }

    try {
      const modules = JSON.parse(data);
      let userPositiveReactions = [];

      // Parcourir tous les modules et leurs cours pour trouver les réactions positives associées à l'utilisateur
      modules.forEach(module => {
        module.courses.forEach(course => {
          if (course.creator && course.creator.userId === userId && course.reactions) { // Vérifie si l'utilisateur est le créateur du cours et si les réactions existent
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
      console.error(error);
      res.status(500).json({ message: "Une erreur s'est produite lors du traitement des données." });
    }
  });
});

// All reactions

// Toutes les réactions
app.get('/user/:userId/allReactions', (req, res) => {
  const { userId } = req.params;
  
  // Chemin d'accès au fichier JSON des modules
  const modulesFilePath = path.join(__dirname, 'json', 'modules.json');

  // Lire le fichier JSON des modules
  fs.readFile(modulesFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Une erreur s'est produite lors de la lecture du fichier des modules." });
    }

    try {
      const modules = JSON.parse(data);
      let userReactions = [];

      // Parcourir tous les modules et leurs cours pour trouver les réactions associées à l'utilisateur
      modules.forEach(module => {
        module.courses.forEach(course => {
          if (course.creator && course.creator.userId === userId && course.reactions) { // Vérifie si l'utilisateur est le créateur du cours et si les réactions existent
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
      console.error(error);
      res.status(500).json({ message: "Une erreur s'est produite lors du traitement des données." });
    }
  });
});

// Companies 

let companiesDatabase = loadCompaniesDatabase();

app.get('/api/pending-companies', (req, res) => {
  const pendingCompanies = loadCompaniesDatabase(); // Charger les données à partir du fichier JSON à chaque appel
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
  const dbPath = './json/companies.json';
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
  const dbPath = './json/companies.json';
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
    const filePath = './json/projectmanagement.json';
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
  fs.readFile('./json/projectmanagement.json', 'utf8', (err, data) => {
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

const connectDatas = require('./json/connectDatas.json'); // Importer les données du fichier JSON

// Route GET pour récupérer tous les utilisateurs
app.get('/api/users', (req, res) => {
  fs.readFile('./json/connectDatas.json', 'utf8', (err, data) => {
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
  fs.readFile('./json/projectmanagement.json', 'utf8', (err, data) => {
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
      fs.writeFile('./json/projectmanagement.json', JSON.stringify(companies, null, 2), 'utf8', err => {
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
  fs.readFile('./json/projectmanagement.json', 'utf8', (err, data) => {
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
  fs.readFile('./json/projectmanagement.json', 'utf8', (err, data) => {
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
      fs.writeFile('./json/projectmanagement.json', JSON.stringify(projectManagementData, null, 2), err => {
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
  fs.readFile('./json/projectmanagement.json', 'utf8', (err, data) => {
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

const dataFilePathProject = './json/projectmanagement.json';

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

  // Recherche du programme associé
  const program = jsonData.find(company => company.programs.some(program => program.programId === programId));

  // Si le programme est trouvé, ajoutez le nouveau projet
  if (program) {
    const programToUpdate = program.programs.find(program => program.programId === programId);
    if (!programToUpdate.projects) {
      programToUpdate.projects = []; // Initialiser un tableau vide de projets
    }
    programToUpdate.projects.push(newProject);

    // Mettre à jour les données dans le fichier JSON
    saveDataToJsonFile(jsonData, dataFilePathProject);
    res.status(201).json({ message: 'Projet ajouté avec succès', newProject });
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
  const companyId = req.params.companyId;
  const programId = req.params.programId;

  // Lire le fichier JSON contenant les données des entreprises
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

      // Renvoyer les participants du programme
      const participants = program.participants || [];
      res.json(participants);
    } catch (error) {
      console.error('Erreur lors de la lecture des données JSON :', error);
      res.status(500).json({ message: 'Une erreur est survenue lors de la lecture des données JSON.' });
    }
  });
});

// GET Projets

app.get('/api/projects/:projectId', (req, res) => {
  const projectId = req.params.projectId;

  // Lire le fichier JSON contenant les données des entreprises
  fs.readFile('./json/projectmanagement.json', 'utf8', (err, data) => {
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
                console.log('Données du projet récupérées avec succès :', project);
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

const lotData = require('./json/projectmanagement.json'); // Renommage de companiesData à lotData
const generateRandomLotString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }
  return randomString;
};

app.post('/api/projects/:projectId/lots', (req, res) => {
  const { projectId } = req.params;
  const newLot = req.body;

  console.log('Données du lot reçues côté serveur :', newLot);

  // Vérification de l'existence du projet
  const foundProjectIndex = lotData.findIndex(company =>
      company.programs.some(program =>
          program.projects && program.projects.some(project => {
              console.log('Project ID:', project.id); // Ajout de console.log
              return project.id === projectId;
          })
      )
  );

  console.log('Found project index:', foundProjectIndex); // Ajout de console.log

  if (foundProjectIndex === -1) {
      console.log('Projet non trouvé');
      return res.status(404).json({ message: 'Projet non trouvé' });
  }

  // Vérification de l'existence du lot par son nom
  const isDuplicate = lotData[foundProjectIndex].programs.some(program =>
    program.projects && program.projects.some(project =>
        project.id === projectId &&
        project.lots && project.lots.some(lot =>
            lot.lotName === newLot.lotName
        )
    )
  );

  console.log('Is duplicate:', isDuplicate); // Ajout de console.log

  if (isDuplicate) {
      console.log('Le lot existe déjà dans le projet');
      return res.status(400).json({ message: 'Le lot existe déjà dans le projet' });
  }

  // Génération de l'identifiant unique du lot
  const randomChars = generateRandomLotString(40);
  const lotId =  randomChars;

  // Ajout de l'ID au nouveau lot
  const lotWithId = { ...newLot, id: lotId };

  // Ajout du nouveau lot au projet correspondant
  lotData[foundProjectIndex].programs.forEach(program =>
    program.projects && program.projects.forEach(project => {
      if (project.id === projectId) {
        if (!project.lots) {
          project.lots = []; // Initialisation du tableau de lots s'il n'existe pas encore
        }
        project.lots.push(lotWithId); // Ajout du nouveau lot au tableau
        console.log('Lot ajouté avec succès au projet', project.projectName);
      }
    })
  );

  // Écriture des données mises à jour dans le fichier JSON
  fs.writeFile('./json/projectmanagement.json', JSON.stringify(lotData, null, 2), (err) => {
    if (err) {
      console.error('Erreur lors de l\'écriture dans le fichier JSON :', err);
      return res.status(500).json({ message: 'Erreur lors de l\'écriture dans le fichier JSON' });
    }
    console.log('Données mises à jour enregistrées dans le fichier JSON');
    // Envoi de la réponse
    return res.status(200).json({ message: 'Lot ajouté avec succès au projet', project: lotData[foundProjectIndex] });
  });
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

  console.log('Données de la BR reçues côté serveur :', newBR);

  // Recherche du projet par son ID
  const project = lotData.find(company =>
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

  // Recherche du lot par son ID dans le projet
  let foundLot;
  project.programs.forEach(program => {
    if (program.projects) {
      program.projects.forEach(proj => {
        if (proj.id === projectId && proj.lots) {
          foundLot = proj.lots.find(lot => lot.id === lotId);
        }
      });
    }
  });

  if (!foundLot) {
    console.log('Lot non trouvé dans le projet');
    return res.status(404).json({ message: 'Lot non trouvé dans le projet' });
  }

  // Ajout de la BR au lot
  if (!foundLot.brs) {
    foundLot.brs = [];
  }
  foundLot.brs.push(newBR);

  // Écriture des données mises à jour dans le fichier JSON
  fs.writeFile('./json/projectmanagement.json', JSON.stringify(lotData, null, 2), (err) => {
    if (err) {
      console.error('Erreur lors de l\'écriture dans le fichier JSON :', err);
      return res.status(500).json({ message: 'Erreur lors de l\'écriture dans le fichier JSON' });
    }
    console.log('Données mises à jour enregistrées dans le fichier JSON');
    // Envoi de la réponse
    return res.status(200).json({ message: 'BR ajoutée avec succès au lot', lot: foundLot });
  });
});




// Lancement du serveur
app.listen(port, () => {
  console.log(`Le serveur est en cours d'exécution sur le port ${port}`);
});

