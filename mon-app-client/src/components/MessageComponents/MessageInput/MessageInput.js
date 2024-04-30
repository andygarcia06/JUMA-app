import React, { useState } from 'react';

const MessageInput = ({ websocket, user, ticket, sendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim() !== '' && websocket && websocket.readyState === WebSocket.OPEN && user && ticket) {
      const messageObject = {
        content: message,
        senderId: user.id, // Assurez-vous que user et ticket ne sont pas undefined
        ticketId: ticket.id,
      };
      websocket.send(JSON.stringify(messageObject));
      setMessage('');
    } else {
      console.error('Impossible d\'envoyer le message. Vérifiez la connexion WebSocket et les données utilisateur.');
    }
  };

  return (
    <div className="message-input">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Écrivez votre message ici..."
      />
      <button onClick={handleSendMessage}>Envoyer</button>
    </div>
  );
};

export default MessageInput;
