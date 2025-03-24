// websocket.js
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const Ticket = require('./schema/Ticket'); // Ajustez le chemin si nécessaire

let wss;
let connectedClients = [];

// Fonction pour associer un client à un userId après la connexion
const associateUserWithClient = (ws, userId) => {
  ws.userId = userId;
  console.log(`Utilisateur ${userId} associé à une connexion WebSocket.`);
};

// Fonction d'initialisation du WebSocket
const initWebSocket = (server) => {
  wss = new WebSocket.Server({ server });

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
        // Diffuser le message à tous les clients connectés
        connectedClients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(parsedMessage));
          }
        });
      }
    });

    // Retirer le client en cas de déconnexion
    ws.on('close', () => {
      console.log('Client déconnecté');
      connectedClients = connectedClients.filter((client) => client !== ws);
    });

    ws.on('error', (error) => {
      console.error('Erreur WebSocket:', error);
    });
  });
};

// Fonction pour diffuser un message aux utilisateurs assignés ou abonnés d'un ticket
// en se basant sur le modèle Ticket dans la base de données
const broadcastToAssignedOrSubscribers = async (ticketId, message) => {
  try {
    const ticket = await Ticket.findOne({ id: ticketId });
    if (ticket) {
      // Fusionner les tableaux d'assigned et de subscribers
      const usersToNotify = [...ticket.assigned, ...ticket.subscribers];
      connectedClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && usersToNotify.includes(client.userId)) {
          client.send(JSON.stringify({ message }));
        }
      });
    }
  } catch (err) {
    console.error('Erreur lors de la récupération du ticket depuis la DB:', err);
  }
};

module.exports = {
  initWebSocket,
  broadcastToAssignedOrSubscribers,
};
