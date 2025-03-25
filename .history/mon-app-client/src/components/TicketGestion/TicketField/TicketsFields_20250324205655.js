import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css';

const TicketFields = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, organization, context = "default", programId, programName } = location.state || {};

  // L'objet ticket initial, avec organization, user (pseudo) et autres
  const [ticket, setTicket] = useState({
    detail: '',
    type: '',
    comments: '',
    rule: '',
    ticketNumber: '',
    title: '',
    organization: organization || '', // Pré-rempli avec organization
    request: '',
    assigned: [], // Participants du programme ou membres de la compagnie
    subscribers: [], // Abonnés sélectionnables (multiple)
    markers: '',
    priority: '',
    creationDate: new Date().toISOString(), // Format ISO pour compatibilité avec Mongoose
    userId: user ? user.userId : '', // Pré-rempli avec l'userId
    programName: programName || '', // Nom du programme
    programId: programId || '', // ID du programme
    status: 'mis en attente'
  });

  console.log("Données reçues dans TicketFields:", { user, organization, context, programId, programName });

  const [members, setMembers] = useState([]); // Membres récupérés depuis l'API
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // Pour afficher la popup de succès

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (context === "company") {
          // Récupérer les membres de la compagnie via l'API
          const response = await axios.get('/api/all-companies');
          // Recherche de la compagnie par son nom
          const selectedCompany = response.data.find(company => company.companyName === organization);
          if (selectedCompany) {
            console.log("[TicketFields] Membres récupérés pour l'organisation", organization, ":", selectedCompany.members);
            setMembers(selectedCompany.members || []);
            setTicket(prevTicket => ({
              ...prevTicket,
              assigned: selectedCompany.members.map(member => member.userId)
            }));
          } else {
            console.warn(`[SERVER] ⚠️ Entreprise non trouvée pour le nom: "${organization}"`);
          }
        } else if (context === "program" && programId) {
          // Récupérer les participants du programme
          const response = await axios.get(`/api/company/${organization}/program/${programId}/participants`);
          console.log("[TicketFields] Participants récupérés pour le programme", programId, "de l'organisation", organization, ":", response.data);
          setMembers(response.data || []);
          setTicket(prevTicket => ({
            ...prevTicket,
            assigned: response.data.map(participant => participant.userId),
            programName: programName || '',
            programId: programId || ''
          }));
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des membres:', error);
      }
    };

    fetchData();
  }, [context, organization, programId, programName]);

  // Gestion des changements pour le champ Subscribers (sélection multiple)
  const handleSubscriberChange = (e) => {
    const selectedSubscribers = Array.from(e.target.selectedOptions, option => option.value);
    setTicket({ ...ticket, subscribers: selectedSubscribers });
  };

  const handleFieldChange = (field, value) => {
    setTicket({ ...ticket, [field]: value });
  };

  const handleSubmit = () => {
    const ticketData = {
      user,
      ticket: {
        ...ticket,
        userId: user ? user.userId : ''
      }
    };

    axios.post('/api/tickets', ticketData)
      .then(response => {
        console.log('Ticket ajouté:', response.data);
        // Afficher la popup de succès
        setShowSuccessPopup(true);
      })
      .catch(error => {
        console.error('Erreur lors de l\'ajout du ticket:', error);
      });
  };

  // Fonction pour fermer la popup et revenir à la page précédente
  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    navigate(-1); // Retour à la page précédente
  };

  return (
    <div className='ticket-container'>
      <div className="ticket-fields ticket-section" id='ticket-fields'>
        <h3>Création de Ticket</h3>
        <div className="ticket-field">
          <label>Nom du Ticket</label>
          <input
            type="text"
            value={ticket.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
          />
        </div>
        <div className="ticket-field">
          <label>Détail</label>
          <textarea
            value={ticket.detail}
            onChange={(e) => handleFieldChange('detail', e.target.value)}
          />
        </div>
        <div className="ticket-field">
          <label>Type</label>
          <input
            type="text"
            value={ticket.type}
            onChange={(e) => handleFieldChange('type', e.target.value)}
          />
        </div>
        <div className="ticket-field">
          <label>Commentaires</label>
          <textarea
            value={ticket.comments}
            onChange={(e) => handleFieldChange('comments', e.target.value)}
          />
        </div>
        <div className="ticket-field">
          <label>Règle de Gestion</label>
          <textarea
            value={ticket.rule}
            onChange={(e) => handleFieldChange('rule', e.target.value)}
          />
        </div>
        <div className="ticket-field">
          <label>Organisation</label>
          <input
            type="text"
            value={ticket.organization}
            readOnly
          />
        </div>
        {context === "program" && (
          <>
            <div className="ticket-field">
              <label>Nom du Programme</label>
              <input
                type="text"
                value={ticket.programName}
                readOnly
              />
            </div>
            <div className="ticket-field">
              <label>ID du Programme</label>
              <input
                type="text"
                value={ticket.programId}
                readOnly
              />
            </div>
          </>
        )}
        <div className="ticket-field">
          <label>Assigné</label>
          <textarea
            value={members.map(member => member.email).join(', ')}
            readOnly
          />
        </div>
        <div className="ticket-field">
          <label>Abonnés</label>
          <select
            multiple
            value={ticket.subscribers}
            onChange={handleSubscriberChange}
          >
            {members.map(member => (
              <option key={member.userId} value={member.userId}>
                {member.email}
              </option>
            ))}
          </select>
        </div>
        <div className="ticket-field">
          <label>Demande</label>
          <input
            type="text"
            value={ticket.request}
            onChange={(e) => handleFieldChange('request', e.target.value)}
          />
        </div>
        <div className="ticket-field">
          <label>Marqueurs</label>
          <input
            type="text"
            value={ticket.markers}
            onChange={(e) => handleFieldChange('markers', e.target.value)}
          />
        </div>
        <div className="ticket-field">
          <label>Priorité</label>
          <input
            type="text"
            value={ticket.priority}
            onChange={(e) => handleFieldChange('priority', e.target.value)}
          />
        </div>
        <div className="ticket-field">
          <label>Date de Création</label>
          <input
            type="text"
            value={new Date(ticket.creationDate).toLocaleString()}
            readOnly
          />
        </div>
        <button onClick={handleSubmit}>Ajouter le Ticket</button>
      </div>

      {/* Popup de succès */}
      {showSuccessPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Ticket créé avec succès !</h3>
            <button onClick={handleClosePopup}>Retour</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketFields;
