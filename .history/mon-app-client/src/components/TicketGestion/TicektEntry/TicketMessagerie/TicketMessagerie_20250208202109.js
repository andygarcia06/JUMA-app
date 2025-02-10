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
  const [modulePopupContent, setModulePopupContent] = useState('');
  const [showModuleEntryPopup, setShowModuleEntryPopup] = useState(false);
  const [popupModuleContent, setPopupModuleContent] = useState('');
  const [popupModuleId, setPopupModuleId] = useState('');
  const [addedModules, setAddedModules] = useState([]);
  const [selectedModuleStats, setSelectedModuleStats] = useState([]);
  const ws = useRef(null);
  const reconnectDelay = useRef(1000);

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

  // 🔥 AJOUT : Gérer l'ajout d'un module à la conversation
  const addModuleToConversation = async (moduleContent) => {
    try {
      const moduleResponse = await axios.post('http://localhost:3001/api/moduleTicket', {
        ticketId,
        userId,
        content: moduleContent
      });

      const moduleId = moduleResponse.data.id;
      console.log('✅ Module créé:', moduleResponse.data);

      const messageData = {
        userId,
        content: `🎓 Un nouveau module a été ajouté : ${moduleContent}`,
        type: 'module',
        moduleId,
        ticketId,
      };

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(messageData));
      }

      const messageResponse = await axios.post(`http://localhost:3001/api/messages/${ticketId}`, messageData);
      setMessageList((prevMessages) => [...prevMessages, messageResponse.data]);

    } catch (error) {
      console.error('❌ Erreur ajout module conversation:', error);
    }
  };

  // 🔥 AJOUT : Ouvrir `ModulePopup` depuis un message contenant un module
  const handleConsultModule = (message) => {
    console.log(`🔍 Consultation du module depuis le message ID: ${message.messageId}`);

    axios.get(`http://localhost:3001/api/moduleTicket/${ticketId}/${message.messageId}`)
      .then(response => {
        setModulePopupContent(response.data.content);
        setShowModulePopup(true);
      })
      .catch(error => {
        console.error('❌ Erreur récupération module:', error);
      });
  };

  return (
    <div className="ticket-messages-container">
      <h3>Messages du Ticket</h3>
      <div className="messages-list">
        {messageList.length > 0 ? (
          messageList.map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.userId === userId ? 'own-message' : ''} ${msg.type === 'module' ? 'clickable-message' : ''}`} 
              onClick={() => { if (msg.type === 'module') handleConsultModule(msg); }}
              style={{ cursor: msg.type === 'module' ? 'pointer' : 'default' }}
            >
              <p><strong>{msg.userId || 'Utilisateur inconnu'}</strong>: {msg.content || 'Message non disponible'}</p>
              <small>{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'Date inconnue'}</small>

              {/* 🔥 AJOUT : Bouton "🔍 Consulter" pour ouvrir la popup */}
              {msg.type === 'module' && (
                <button onClick={(e) => { e.stopPropagation(); handleConsultModule(msg); }}>🔍 Consulter</button>
              )}
            </div>
          ))
        ) : <p>Aucun message pour ce ticket.</p>}
      </div>

      <form className="message-form" onSubmit={(e) => { e.preventDefault(); setNewMessage(''); }}>
        <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Tapez votre message..." rows="3" />
        <button type="submit">Envoyer</button>
      </form>

      {/* 🔥 AJOUT : Popup affichant le module sélectionné */}
      {showModulePopup && <ModulePopup content={modulePopupContent} onClose={() => setShowModulePopup(false)} />}

      <button onClick={() => { }}>🔍 Rechercher dans la base de connaissances</button>
      {knowledgeSuggestions.length > 0 && <TicketKnowledge suggestions={knowledgeSuggestions} />}
      {isAuthorizedToCreateModule && <CreateModuleTicket ticketId={ticketId} userId={userId} />}
      <ModuleSuggestion userInput={newMessage} onModuleSelection={addModuleToConversation} selectedModuleStats={selectedModuleStats} updateModuleStats={setSelectedModuleStats} userId={userId} />
    </div>
  );
};

export default TicketMessagerie;
