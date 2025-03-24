const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');


const app = express();
const port = 3002; // Port pour le serveur WebSocket distinct

// Serveur HTTP pour Express et WebSocket
const server = http.createServer(app);

// Créez le WebSocket Server en utilisant le serveur HTTP Express
const wss = new WebSocket.Server({ server });

// Stockage pour suivre les connexions WebSocket et les utilisateurs associés
let connectedClients = [];

// Fonction pour associer un client à un userId après la connexion
const associateUserWithClient = (ws, userId) => {
  ws.userId = userId;
  console.log(`Utilisateur ${userId} associé à une connexion WebSocket.`);
};

// Fonction pour lire les tickets depuis un fichier JSON
const readTicketsFromFile = () => {
  try {
    const data = fs.readFileSync(path.join(__dirname, './json/tickets.json'), 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erreur lors de la lecture des tickets:', err);
    return [];
  }
};

// WebSocket Connection Handling
wss.on('connection', (ws) => {
  console.log('Client connecté via WebSocket');
  connectedClients.push(ws);

  // Envoyer un message de bienvenue
  ws.send(JSON.stringify({ message: 'Bienvenue sur le WebSocket. Veuillez envoyer votre userId.' }));

  // Gestion des messages entrants
  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);
  
    if (parsedMessage.type === 'userId') {
      associateUserWithClient(ws, parsedMessage.userId);
    } else if (parsedMessage.type === 'message') {
      console.log('Message reçu du client:', parsedMessage.content);
  
      connectedClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedMessage)); // Diffuse le message à tous les clients
        }
      });
    }
  });

  // Supprimer le client s'il se déconnecte
  ws.on('close', () => {
    console.log('Client déconnecté');
    connectedClients = connectedClients.filter((client) => client !== ws);
  });

  ws.on('error', (error) => {
    console.error('Erreur WebSocket:', error);
  });
});




// Fonction pour envoyer un message à tous les clients assignés ou abonnés
const broadcastToAssignedOrSubscribers = (ticketId, message) => {
  const tickets = readTicketsFromFile();
  const ticket = tickets.find(ticket => ticket.id === ticketId);
  if (ticket) {
    const usersToNotify = [...ticket.assigned, ...ticket.subscribers];
    connectedClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && usersToNotify.includes(client.userId)) {
        client.send(JSON.stringify({ message }));
      }
    });
  }
};

// Exposez une simple route Express, au cas où vous en auriez besoin pour des vérifications
app.get('/', (req, res) => {
  res.send('Serveur WebSocket et Express fonctionnent!');
});

// Lancer le serveur HTTP (Express + WebSocket)
server.listen(port, () => {
  console.log(`Serveur WebSocket en cours d'exécution sur le port ${port}`);
});

module.exports = { broadcastToAssignedOrSubscribers };
