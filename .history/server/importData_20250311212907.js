// importData.js

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Connexion à MongoDB (utilise MONGO_URI défini dans vos variables d'environnement ou la valeur par défaut)
const MONGO_URI = 'mongodb+srv://andygarcia:Ansy9362!@cluster0.d0xzm.mongodb.net/Jumadb';
mongoose.connect(MONGO_URI, {
})
.then(() => console.log('✅ Connecté à MongoDB Atlas'))
.catch(err => console.error('❌ Erreur de connexion à MongoDB Atlas:', err));

// Importation de vos modèles existants
const User = require('./schema/User');
const Company = require('./schema/Company');
const ProjectManagement = require('./schema/ProjectManagement');
const Ticket = require('./schema/Ticket');
// const TicketData = require('./schema/TicketData');
const UserValidateCourse = require('./schema/UserValidateCourse');
const DatabaseModel = require('./schema/Database'); // Par exemple
const UserProgress = require('./schema/UserProgress');
const ModuleTicket = require('./schema/ModuleTicket');
const Module = require('./schema/Module');
const Synonym = require('./schema/Synonym');
const DBEntryTickets = require('./schema/DBEntryTickets');
const DataCompanies = require('./schema/DataCompanies');


// Fonction pour lire un fichier JSON
const loadJSON = fileName => JSON.parse(fs.readFileSync(path.join(__dirname, 'json', fileName), 'utf-8'));

// Fonction asynchrone d'import des données
const importData = async () => {
  try {
    // // Importer DBEntryTickets (à partir de dbEntryTickets.json)
    // const dbEntryTicketsData = loadJSON('dbEntryTickets.json');
    // await DBEntryTickets.insertMany(dbEntryTicketsData);
    // console.log('DBEntryTickets importé');

    // Importer les utilisateurs (connectDatas.json)
    // const usersData = loadJSON('connectDatas.json');
    // await User.insertMany(usersData);
    // console.log('Utilisateurs importés');

    // Importer la gestion de projets (projectmanagement.json)
    // const projectManagementData = loadJSON('projectmanagement.json');
    // await ProjectManagement.insertMany(projectManagementData);
    // console.log('Gestion de projets importée');

    // Importer les entreprises (companies.json)
    // const companiesData = loadJSON('companies.json');
    // await Company.insertMany(companiesData);
    // console.log('Entreprises importées');

    // Importer les tickets (tickets.json)
    // const ticketsData = loadJSON('tickets.json');
    // await Ticket.insertMany(ticketsData);
    // console.log('Tickets importés');

    // Importer ticketsData (ticketsData.json)
    // const ticketsDataData = loadJSON('ticketsData.json');
    // await TicketData.insertMany(ticketsDataData);
    // console.log('TicketsData importé');

    const dataCompanies = loadJSON('datacompanies.json');
    await DataCompanies.insertMany(dataCompanies);
    console.log('✅ Validations de cours importées avec succès.');

    // Importer les validations de cours (uservalidatecourse.json)
    const userValidateCoursesData = loadJSON('uservalidatecourse.json');
    await UserValidateCourse.insertMany(userValidateCoursesData);
    console.log('Validations de cours importées');

    // Importer d'autres données si nécessaire (par exemple, database.json)
    const databaseData = loadJSON('database.json');
    await DatabaseModel.insertMany(databaseData);
    console.log('Database importée');

    // Importer la progression utilisateur (userProgress.json)
    const userProgressData = loadJSON('userProgress.json');
    await UserProgress.insertMany(userProgressData);
    console.log('Progression utilisateur importée');

    // Importer les modules tickets (moduleTickets.json)
    const moduleTicketsData = loadJSON('moduleTickets.json');
    await ModuleTicket.insertMany(moduleTicketsData);
    console.log('ModuleTickets importés');

    // Importer les modules (modules.json)
    const modulesData = loadJSON('modules.json');
    await Module.insertMany(modulesData);
    console.log('Modules importés');

    // Importer les synonymes (synonymes.json)
    const synonymsData = loadJSON('synonymes.json');
    await Synonym.insertMany(synonymsData);
    console.log('Synonymes importés');

    console.log('✅ Importation terminée');
    process.exit();
  } catch (err) {
    console.error('❌ Erreur lors de l\'importation des données:', err);
    process.exit(1);
  }
};

importData();
