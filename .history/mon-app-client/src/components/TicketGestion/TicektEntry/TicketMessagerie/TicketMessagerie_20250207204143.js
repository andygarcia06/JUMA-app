import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './TicketMessagerie.css';
import TicketKnowledge from '../TicketKnowledge/TicketKnowledge';
import CreateModuleTicket from '../../ModuleTicket/ModuleTicket';
import ModulePopup from '../ModulePopup/ModulePopup'; 
import ModuleSuggestion from '../../ModuleSuggestion/ModuleSuggestion'; 
import ModuleEntryPopup from '../ModuleEntryPopup/ModuleEntryPopup';

const TicketMessagerie = ({ ticketId, userId }) => {
  console.log('TicketMessagerie userId :', userId);

  const [userRole, setUserRole] = useState(''); 
  const [newMessage, setNewMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const [knowledgeSuggestions, setKnowledgeSuggestions] = useState([]);
  const [isAuthorizedToCreateModule, setIsAuthorizedToCreateModule] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showModulePopup, setShowModulePopup] = useState(false);
  const [moduleTicketContent, setModuleTicketContent] = useState('');
  const [selectedModuleStats, setSelectedModuleStats] = useState([]);
  const [showModuleEntryPopup, setShowModuleEntryPopup] = useState(false);
  const [popupModuleContent, setPopupModuleContent] = useState('');
  const [popupModuleId, setPopupModuleId] = useState('');
  
  const ws = useRef(null);
  const reconnectDelay = useRef(1000);

  // 🔹 Fonction pour se connecter au WebSocket
  const connectWebSocket = () => {
    ws.current = new WebSocket('ws://localhost:3002');

    ws.current.onopen = () => {
      console.log('Connecté au WebSocket');
      reconnectDelay.current = 1000;
      ws.current.send(JSON.stringify({ type: 'userId', userId }));
    };

    ws.current.onmessage = (event) => {
      const receivedMessage = JSON.parse(event.data);
      if (receivedMessage.content) {
        setMessageList((prevMessages) => [...prevMessages, receivedMessage]);
      }
    };

    ws.current.onclose = () => {
      console.log('Connexion WebSocket fermée. Tentative de reconnexion...');
      setTimeout(() => {
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 16000);
        connectWebSocket();
      }, reconnectDelay.current);
    };

    ws.current.onerror = (error) => console.error('Erreur WebSocket:', error);
  };

  useEffect(() => {
    console.log(`Ticket ID reçu: ${ticketId}, User ID reçu: ${userId}`);

    // 🔹 Charger les données utilisateur, messages et permissions
    axios.get(`http://localhost:3001/api/users/${userId}`)
      .then(res => setUserRole(res.data.role))
      .catch(err => console.error('Erreur rôle utilisateur:', err));

    axios.get(`http://localhost:3001/api/messages/${ticketId}`)
      .then(res => setMessageList(res.data))
      .catch(err => console.error('Erreur chargement messages:', err));

    axios.get(`http://localhost:3001/api/checkPermissions/${ticketId}/${userId}`)
      .then(res => setIsAuthorizedToCreateModule(res.data.isAuthorized))
      .catch(err => console.error('Erreur autorisation:', err));

    connectWebSocket();

    return () => { if (ws.current) ws.current.close(); };
  }, [ticketId, userId]);

  // 🔹 Gérer l'envoi d'un message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = { userId, content: newMessage, ticketId };
    
    try {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(messageData));
      }
      
      const response = await axios.post(`http://localhost:3001/api/messages/${ticketId}`, messageData);
      setMessageList((prev) => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error("Erreur d'envoi du message :", error);
    }
  };

  // 🔹 Ajouter un module en tant que message
  const addModuleToConversation = async (moduleContent) => {
    const messageData = {
      userId: 'system',
      content: `🎓 Module ajouté : ${moduleContent}`,
      ticketId,
    };

    try {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(messageData));
      }

      const response = await axios.post(`http://localhost:3001/api/messages/${ticketId}`, messageData);
      setMessageList((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Erreur ajout module conversation:", error);
    }
  };

  // 🔹 Ouvrir un module depuis un message
  const handleOpenModuleEntryPopup = (message) => {
    axios.get(`http://localhost:3001/api/messages/${message.messageId}/modules/`)
      .then((response) => {
        setPopupModuleId(response.data.moduleId);
        setPopupModuleContent(response.data.content);
        setShowModuleEntryPopup(true);
      })
      .catch(err => console.error('Erreur récupération module:', err));
  };

  // 🔹 Consulter un module
  const handleConsultModule = (message) => {
    axios.get(`http://localhost:3001/api/moduleTicket/${ticketId}/${message.messageId}`)
      .then(res => {
        setModuleTicketContent(res.data.content);
        setShowModulePopup(true);
      })
      .catch(err => console.error('Erreur récupération module:', err));
  };

  return (
    <div className="ticket-messages-container">
      <h3>Messages du Ticket</h3>
      <div className="messages-list">
        {messageList.length > 0 ? (
          messageList.map((msg, index) => (
            <div key={index} className={`message ${msg.userId === userId ? 'own-message' : ''}`}>
              <p><strong>{msg.userId || 'Utilisateur inconnu'}</strong>: {msg.content || 'Message non disponible'}</p>
              <small>{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'Date inconnue'}</small>
              {msg.content.includes('Module ajouté') && <button onClick={() => handleOpenModuleEntryPopup(msg)}>📘 Voir le module</button>}
            </div>
          ))
        ) : <p>Aucun message pour ce ticket.</p>}
      </div>

      <form className="message-form" onSubmit={handleSendMessage}>
        <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Tapez votre message..." rows="3" />
        <button type="submit">Envoyer</button>
      </form>

      {showModuleEntryPopup && <ModuleEntryPopup content={popupModuleContent} moduleId={popupModuleId} onClose={() => setShowModuleEntryPopup(false)} userId={userId} />}
      {isAuthorizedToCreateModule && <CreateModuleTicket ticketId={ticketId} userId={userId} onModuleCreated={addModuleToConversation} />}
      {showModulePopup && <ModulePopup content={moduleTicketContent} onClose={() => setShowModulePopup(false)} />}
      <ModuleSuggestion userInput={newMessage} onModuleSelection={addModuleToConversation} selectedModuleStats={selectedModuleStats} updateModuleStats={setSelectedModuleStats} userId={userId} />
    </div>
  );
};

export default TicketMessagerie;
