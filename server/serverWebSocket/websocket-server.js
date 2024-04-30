const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const wss = new WebSocket.Server({ port: 3002 });

wss.on('connection', (ws, request) => {
  const token = request.headers['sec-websocket-protocol'];
  
  if (!token) {
    ws.close(1000, 'Token manquant');
    return;
  }

  try {
    const user = jwt.verify(token, 'votreCléSecrète');
    console.log('Utilisateur connecté:', user.id);

    ws.on('message', (message) => {
      // Diffusez le message à tous les clients connectés
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    ws.on('close', () => console.log('Connexion WebSocket fermée'));
  } catch (error) {
    ws.close(1002, 'Token invalide');
  }
});

console.log('WebSocket server is running on ws://localhost:3002');
