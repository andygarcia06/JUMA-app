import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './TicketMessagerie.css';
import ModulePopup from '../ModulePopup/ModulePopup';
import ModuleEntryPopup from '../ModuleEntryPopup/ModuleEntryPopup'; // Nouveau composant pour la feature
import TicketKnowledge from '../TicketKnowledge/TicketKnowledge';
import CreateModuleTicket from '../../ModuleTicket/ModuleTicket';
import ModuleSuggestion from '../../ModuleSuggestion/ModuleSuggestion';

const TicketMessagerie = ({ ticketId, userId }) => {
  const [userRole, setUserRole] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const [knowledgeSuggestions, setKnowledgeSuggestions] = useState([]);
  const [isAuthorizedToCreateModule, setIsAuthorizedToCreateModule] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showModulePopup, setShowModulePopup] = useState(false);
  const [moduleContent, setModuleContent] = useState('');
  const [moduleTicketContent, setModuleTicketContent] = useState('');
  const [addedModules, setAddedModules] = useState([]);
  const [selectedModuleStats, setSelectedModuleStats] = useState([]);
  const [showModuleEntryPopup, setShowModuleEntryPopup] = useState(false); // Nouveau état pour gérer la popup
  const [popupModuleContent, setPopupModuleContent] = useState('');

  const ws = useRef(null);
  const reconnectDelay = useRef(1000);

  // Fonction pour se connecter au WebSocket
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
      } else if (receivedMessage.message) {
        console.log('Message du serveur:', receivedMessage.message);
      } else {
        console.error('Message mal formaté reçu:', receivedMessage);
      }
    };

    ws.current.onclose = () => {
      console.log('Connexion WebSocket fermée. Tentative de reconnexion...');
      setTimeout(() => {
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 16000);
        connectWebSocket();
      }, reconnectDelay.current);
    };

    ws.current.onerror = (error) => {
      console.error('Erreur WebSocket:', error);
    };
  };

  useEffect(() => {
    console.log(`Ticket ID reçu dans TicketMessagerie: ${ticketId}`);
    console.log(`User ID reçu dans TicketMessagerie: ${userId}`);

    // Récupérer le rôle de l'utilisateur
    axios
      .get(`http://localhost:3001/api/users/${userId}`)
      .then((response) => {
        setUserRole(response.data.role);
      })
      .catch((error) => console.error('Erreur lors de la récupération du rôle utilisateur:', error));

    // Récupérer les messages du ticket
    axios
      .get(`http://localhost:3001/api/messages/${ticketId}`)
      .then((response) => {
        setMessageList(response.data);
      })
      .catch((error) => console.error('Erreur lors de la récupération des messages:', error));

    // Vérifier si l'utilisateur est autorisé à créer un moduleTicket
    axios
      .get(`http://localhost:3001/api/checkPermissions/${ticketId}/${userId}`)
      .then((response) => {
        setIsAuthorizedToCreateModule(response.data.isAuthorized);
      })
      .catch((error) => console.error('Erreur lors de la vérification des autorisations:', error));

    // Connexion WebSocket
    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [ticketId, userId]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (newMessage.trim()) {
      const messageData = {
        userId,
        content: newMessage,
        ticketId,
      };

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(messageData));
      }

      axios
        .post(`http://localhost:3001/api/messages/${ticketId}`, messageData)
        .then((response) => {
          setMessageList((prevMessages) => [...prevMessages, response.data]);
        })
        .catch((error) => console.error('Erreur lors de l\'envoi du message:', error));

      setNewMessage('');
    }
  };

  const handleConsultModule = (message) => {
    axios
      .get(`http://localhost:3001/api/moduleTicket/${ticketId}/${message.messageId}`)
      .then((response) => {
        setModuleTicketContent(response.data.content);
        setShowModulePopup(true);
      })
      .catch((error) => console.error('Erreur lors de la récupération du moduleTicket:', error));
  };

  const handleOpenModuleEntryPopup = (message) => {
    if (message.content.includes('Module ajouté:')) {
      setPopupModuleContent(message.content);
      setShowModuleEntryPopup(true);
    }
  };

  const handleClosePopup = () => {
    setShowModulePopup(false);
    setModuleContent('');
    setModuleTicketContent('');
  };

  const handleCloseModuleEntryPopup = () => {
    setShowModuleEntryPopup(false);
    setPopupModuleContent('');
  };

  const handleValidateModule = () => {
    console.log('Module validé avec succès.');
    setShowModuleEntryPopup(false);
  };

  const fetchKnowledgeSuggestions = () => {
    const query = newMessage;

    if (query.trim() === '') {
      setKnowledgeSuggestions([]);
      return;
    }

    axios
      .get(`http://localhost:3001/api/knowledge/search`, { params: { query } })
      .then((response) => {
        setKnowledgeSuggestions(response.data);
      })
      .catch((error) => console.error('Erreur lors de la recherche dans la base de connaissances:', error));
  };

  return (
    <div className="ticket-messages-container">
      <h3>Messages du Ticket</h3>

      <div className="messages-list">
        {messageList.length ? (
          messageList.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.userId === userId ? 'own-message' : ''}`}
              onClick={() => handleOpenModuleEntryPopup(msg)}
            >
              <p>
                <strong>{msg.userId || 'Utilisateur inconnu'}</strong>: {msg.content || 'Message non disponible'}
              </p>
              <small>{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'Date inconnue'}</small>
            </div>
          ))
        ) : (
          <p>Aucun message pour ce ticket.</p>
        )}
      </div>

      <form className="message-form" onSubmit={handleSendMessage}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Tapez votre message..."
          rows="3"
        />
        <button type="submit">Envoyer</button>
      </form>

      <button onClick={fetchKnowledgeSuggestions}>Rechercher dans la base de connaissances</button>

      {knowledgeSuggestions.length > 0 && (
        <TicketKnowledge suggestions={knowledgeSuggestions} onSelectCourse={(course) => console.log('Course selected:', course)} />
      )}

      {isAuthorizedToCreateModule && (
        <CreateModuleTicket
          ticketId={ticketId}
          userId={userId}
          onModuleCreated={(moduleContent) => console.log('Module ajouté:', moduleContent)}
        />
      )}

      {showModulePopup && <ModulePopup content={moduleTicketContent} onClose={handleClosePopup} />}

      {showModuleEntryPopup && (
        <ModuleEntryPopup
          content={popupModuleContent}
          onClose={handleCloseModuleEntryPopup}
          onValidate={handleValidateModule}
        />
      )}
    </div>
  );
};

export default TicketMessagerie;
