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
  const [editingMessage, setEditingMessage] = useState(null); // Message en cours d'édition
  const [showModulePopup, setShowModulePopup] = useState(false); // Contrôle de la popup
  const [moduleContent, setModuleContent] = useState(''); // Contenu du module à afficher
  const [moduleTicketContent, setModuleTicketContent] = useState(''); // Contenu des moduleTickets à afficher
  const [addedModules, setAddedModules] = useState([]); // État pour suivre les modules ajoutés
  const [selectedModuleStats, setSelectedModuleStats] = useState([]); // Stockage des statistiques de modules sélectionnés
  const [showModuleEntryPopup, setShowModuleEntryPopup] = useState(false); // Popup pour modules ajoutés
  const [popupModuleContent, setPopupModuleContent] = useState(''); // Contenu du module ajouté
  const [popupModuleId, setPopupModuleId] = useState(''); // Nouvel état pour stocker l'ID du module

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
    axios.get(`/api/users/${userId}`)
      .then(response => {
        setUserRole(response.data.role);
      })
      .catch(error => console.error('Erreur lors de la récupération du rôle utilisateur:', error));

    // Récupérer les messages du ticket
    axios.get(`/api/messages/${ticketId}`)
      .then(response => {
        setMessageList(response.data);
      })
      .catch(error => console.error('Erreur lors de la récupération des messages:', error));

    // Vérifier si l'utilisateur est autorisé à créer un moduleTicket
    axios.get(`/api/checkPermissions/${ticketId}/${userId}`)
      .then(response => {
        setIsAuthorizedToCreateModule(response.data.isAuthorized);
      })
      .catch(error => console.error('Erreur lors de la vérification des autorisations:', error));

    // Connexion WebSocket
    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [ticketId, userId]);

  // Fonction pour gérer l'envoi d'un message
  const handleSendMessage = (e) => {
    e.preventDefault();
    console.log('User ID:', userId);

    if (newMessage.trim()) {
      // Si un message système est en édition, on ajoute du contenu sans supprimer l'ancien
      if (editingMessage) {
        const updatedContent = `${editingMessage.content} ${newMessage}`; // Ajout de nouveau contenu

        // Mise à jour du message dans la liste locale
        const updatedMessages = messageList.map((msg) => 
          msg.messageId === editingMessage.messageId 
            ? { ...msg, content: updatedContent } 
            : msg
        );

        setMessageList(updatedMessages);

        // Mise à jour via WebSocket et API
        const messageData = {
          userId: 'system',
          content: updatedContent,
          ticketId,
          messageId: editingMessage.messageId, // Envoie l'ID du message pour la mise à jour
        };

        // WebSocket
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify(messageData));
        }

        // Mise à jour dans l'API
        axios.put(`/api/messages/${ticketId}/${editingMessage.messageId}`, { content: newMessage })
        .then(response => {
          console.log('Message mis à jour et sauvegardé:', response.data);
        })
        .catch(error => {
          console.error('Erreur lors de la mise à jour du message:', error);
        });

        setNewMessage(''); // Réinitialiser le champ de texte
        setEditingMessage(null); // Réinitialiser le mode édition
      } else {
        // Envoi d'un nouveau message
        const messageData = {
          userId,
          content: newMessage,
          ticketId,
        };

        // Envoi via WebSocket
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify(messageData));
        }

        // Enregistrement du message via Axios pour l'API
        axios.post(`/api/messages/${ticketId}`, messageData)
          .then(response => {
            console.log('Message envoyé et sauvegardé:', response.data);
            setMessageList((prevMessages) => [...prevMessages, response.data]); // Ajouter à la liste des messages
          })
          .catch(error => {
            console.error('Erreur lors de l\'envoi du message:', error);
          });

        // Réinitialisation du champ de message
        setNewMessage('');
      }
    }
  };

  const handleOpenModuleEntryPopup = (message) => {
    const { messageId } = message; // Récupérer l'ID du message cliqué

    console.log('Message ID cliqué :', messageId);

    // Envoyer une requête au backend pour récupérer le moduleId associé au messageId
    axios
        .get(`/api/messages/${messageId}/modules/`)
        .then((response) => {
            const { moduleId, content } = response.data; // Contenu et moduleId du message

            if (moduleId) {
                console.log('Module ID associé :', moduleId);
                setPopupModuleId(moduleId); // Stocker le moduleId
            } else {
                console.log('Aucun module ID associé à ce message.');
            }

            setPopupModuleContent(content); // Stocker le contenu du message
            setShowModuleEntryPopup(true); // Afficher la popup
        })
        .catch((error) => {
            console.error('Erreur lors de la récupération des détails du message :', error);
        });
  };

  // Fonction pour fermer la popup
  const handleCloseModuleEntryPopup = () => {
    setShowModuleEntryPopup(false);
    setPopupModuleContent('');
  };

  // Fonction pour valider un module (ex. action API, log)
  const handleValidateModule = () => {
    console.log('Module validé avec succès :', popupModuleContent);
    setShowModuleEntryPopup(false);
  };

  // Fonction pour consulter le module (ouvrir la popup)
  const handleConsultModule = (message) => {
    axios.get(`/api/moduleTicket/${ticketId}/${message.messageId}`)  // Ajout du messageId dans la requête
      .then(response => {
        const moduleTicketContent = response.data.content; // Récupère le contenu des moduleTickets
        setModuleTicketContent(moduleTicketContent); // Stocker le contenu du moduleTicket
        setShowModulePopup(true); // Ouvrir la popup
      })
      .catch(error => {
        console.error('Erreur lors de la récupération du moduleTicket:', error);
      });
  };

  // Fonction pour fermer la popup
  const handleClosePopup = () => {
    setShowModulePopup(false);
    setModuleContent('');
    setModuleTicketContent('');
  };

  const fetchKnowledgeSuggestions = () => {
    const query = newMessage;

    if (query.trim() === '') {
      setKnowledgeSuggestions([]);
      return;
    }

    axios.get(`/api/knowledge/search`, { params: { query } })
      .then((response) => {
        setKnowledgeSuggestions(response.data);
      })
      .catch((error) => {
        console.error('Erreur lors de la recherche dans la base de connaissances:', error);
      });
  };

  const handleSelectCourse = (course) => {
    console.log('Cours sélectionné :', course);

    // Si le module a déjà été ajouté, on ne l'ajoute pas à nouveau
    if (addedModules.includes(course.id)) {
      console.log('Ce module a déjà été ajouté.');
      return;
    }

    // Préparer le contenu du message à partir du cours sélectionné
    const title = course.title || 'Module';
    const description = course.description || course.content || 'Pas de description';

    // Contenu du message basé sur le module sélectionné
    const courseContent = `Cours sélectionné : ${title} - ${description}`;

    // Ajouter le module sélectionné à la conversation du ticket
    const messageData = {
      userId, // On remonte le module au nom de l'utilisateur courant
      content: `Module ajouté: ${courseContent}`, 
      ticketId,
      moduleId: course.id, // Inclure l'ID du module dans l'objet
    };

    // Envoi du message via WebSocket si connecté
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(messageData));
    }

    // Enregistrement du message via Axios pour l'API
    axios.post(`/api/messages/${ticketId}`, messageData)
      .then(response => {
        console.log('Module ajouté à la conversation:', response.data);
        setMessageList((prevMessages) => [...prevMessages, response.data]); // Ajouter à la liste des messages

        // Ajouter l'ID du module sélectionné à la liste des modules déjà ajoutés
        setAddedModules((prevAdded) => [...prevAdded, course.id]);

        // Enregistrer l'ID du module sélectionné dans l'entrée du ticket via API
        return axios.post(`/api/tickets/${ticketId}/selectedModule`, { moduleId: course.id });
      })
      .then(response => {
        console.log('ID du module sélectionné enregistré dans le ticket:', response.data);
        fetchModuleStats(newMessage);
      })
      .catch(error => {
        console.error('Erreur lors de l\'ajout du module à la conversation ou de l\'enregistrement du module sélectionné:', error);
      });
  };

  const addModuleToConversation = (moduleContent) => {
    const messageData = {
      userId: 'system', 
      content: `ticketElearning : ${moduleContent}`, 
      ticketId,
    };

    // Envoi du message via WebSocket s'il est connecté
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(messageData));
    }

    // Enregistrement du message via Axios pour l'API
    axios.post(`/api/messages/${ticketId}`, messageData)
      .then(response => {
        console.log('Module ajouté à la conversation:', response.data);
        setMessageList((prevMessages) => [...prevMessages, response.data]); // Ajouter à la liste des messages
      })
      .catch(error => {
        console.error('Erreur lors de l\'ajout du module à la conversation:', error);
      });
  };

  const fetchModuleStats = (input) => {
    axios.get(`/api/moduleStats`, { params: { query: input } })
      .then(response => {
        setSelectedModuleStats(response.data); // Mettre à jour les statistiques des modules
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des statistiques des modules:', error);
      });
  };

  const handleEditSystemMessage = (message) => {
    setEditingMessage(message); // Sauvegarde le message en cours d'édition
    setNewMessage(''); // Réinitialise la zone de texte
  };

  return (
    <div className="ticket-messages-container">
      <h3>Messages du Ticket</h3>
      <div className="messages-list">
        {messageList.length > 0 ? (
          messageList.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.userId === userId ? 'own-message' : ''} ${
                msg.content.includes('Module ajouté:') ? 'clickable-message' : ''
              }`}
              onClick={() => {
                if (msg.content.includes('Module ajouté:')) handleOpenModuleEntryPopup(msg);
              }}
            >
              <p>
                <strong>{msg.userId || 'Utilisateur inconnu'}</strong>: {msg.content || 'Message non disponible'}
              </p>
              <small>{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'Date inconnue'}</small>
              {msg.userId === 'system' && (isAuthorizedToCreateModule || userRole === 'admin') && (
                <>
                  <button onClick={() => handleEditSystemMessage(msg)}>Modifier</button>
                  <button onClick={() => handleConsultModule(msg)}>Consulter</button>
                </>
              )}
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
          placeholder={editingMessage ? `Ajoutez du contenu à : ${editingMessage.content}` : 'Tapez votre message...'}
          rows="3"
        />
        <button type="submit">{editingMessage ? 'Ajouter au module' : 'Envoyer'}</button>
      </form>

      {showModuleEntryPopup && (
        <ModuleEntryPopup
          content={popupModuleContent}
          moduleId={popupModuleId}
          onClose={handleCloseModuleEntryPopup}
          onValidate={handleValidateModule}
          userId={userId}
        />
      )}

      <button onClick={fetchKnowledgeSuggestions}>Rechercher dans la base de connaissances</button>

      {knowledgeSuggestions.length > 0 && (
        <TicketKnowledge suggestions={knowledgeSuggestions} onSelectCourse={handleSelectCourse} />
      )}

      {isAuthorizedToCreateModule && (
        <CreateModuleTicket ticketId={ticketId} userId={userId} onModuleCreated={addModuleToConversation} />
      )}

      {showModulePopup && <ModulePopup content={moduleTicketContent} onClose={handleClosePopup} />}
      
      <ModuleSuggestion
        userInput={newMessage}
        onModuleSelection={handleSelectCourse}
        selectedModuleStats={selectedModuleStats}
        updateModuleStats={setSelectedModuleStats}import React, { useState, useEffect, useRef } from 'react';
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
  const [showModuleEntryPopup, setShowModuleEntryPopup] = useState(false);
  const [popupModuleContent, setPopupModuleContent] = useState('');
  const [popupModuleId, setPopupModuleId] = useState('');
  const [addedModules, setAddedModules] = useState([]);
  const ws = useRef(null);
  const reconnectDelay = useRef(1000);

  // 🔥 AJOUT : WebSocket écoute les nouveaux messages
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

    axios.get(`/api/users/${userId}`)
      .then(res => setUserRole(res.data.role))
      .catch(err => console.error('Erreur rôle utilisateur:', err));

    axios.get(`/api/messages/${ticketId}`)
      .then(res => setMessageList(res.data))
      .catch(err => console.error('Erreur chargement messages:', err));

    axios.get(`/api/checkPermissions/${ticketId}/${userId}`)
      .then(res => setIsAuthorizedToCreateModule(res.data.isAuthorized))
      .catch(err => console.error('Erreur autorisation:', err));

    connectWebSocket();

    return () => { if (ws.current) ws.current.close(); };
  }, [ticketId, userId]);

  // 🔥 AJOUT : Gérer l'ajout d'un module à la conversation
  const addModuleToConversation = async (moduleContent) => {
    try {
      const moduleResponse = await axios.post('/api/moduleTicket', {
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

      const messageResponse = await axios.post(`/api/messages/${ticketId}`, messageData);
      setMessageList((prevMessages) => [...prevMessages, messageResponse.data]);

    } catch (error) {
      console.error('❌ Erreur ajout module conversation:', error);
    }
  };

  // 🔥 AJOUT : Ouvrir un module depuis un message
  const handleOpenModuleEntryPopup = (message) => {
    axios.get(`/api/messages/${message.messageId}/modules/`)
      .then((response) => {
        setPopupModuleId(response.data.moduleId);
        setPopupModuleContent(response.data.content);
        setShowModuleEntryPopup(true);
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
              {msg.type === 'module' && (
                <button onClick={() => handleOpenModuleEntryPopup(msg)}>📘 Voir le module</button>
              )}
            </div>
          ))
        ) : <p>Aucun message pour ce ticket.</p>}
      </div>

      <form className="message-form" onSubmit={(e) => { e.preventDefault(); addModuleToConversation(newMessage); setNewMessage(''); }}>
        <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Tapez votre message..." rows="3" />
        <button type="submit">Envoyer</button>
      </form>

      {showModuleEntryPopup && <ModuleEntryPopup content={popupModuleContent} moduleId={popupModuleId} onClose={() => setShowModuleEntryPopup(false)} userId={userId} />}
      {isAuthorizedToCreateModule && <CreateModuleTicket ticketId={ticketId} userId={userId} onModuleCreated={addModuleToConversation} />}
      {showModulePopup && <ModulePopup content={moduleTicketContent} onClose={() => setShowModulePopup(false)} />}
      <ModuleSuggestion userInput={newMessage} onModuleSelection={addModuleToConversation} />
    </div>
  );
};

export default TicketMessagerie;

        userId={userId}
      />
    </div>
  );
};

export default TicketMessagerie;
