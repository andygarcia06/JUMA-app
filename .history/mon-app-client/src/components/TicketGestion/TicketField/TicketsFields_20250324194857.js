import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './style.css';

const TicketFields = () => {
  const location = useLocation();
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
    creationDate: new Date().toLocaleDateString(),
    userId: user ? user.pseudo : '', // Pré-rempli avec le pseudo
    programName: programName || '', // Nom du programme
    programId: programId || '', // ID du programme
    status: 'mis en attente'
  });

  console.log("Données reçues dans TicketFields:", { user, organization, context, programId, programName });

  const [members, setMembers] = useState([]); // Membres récupérés depuis l'API

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        if (context === "company") {
          // Récupérer les membres de la compagnie via l'API
          const response = await axios.get(`/api/company/${organization}/members`);
          console.log("[TicketFields] Membres récupérés pour l'organisation", organization, ":", response.data);
          setMembers(response.data || []);
          const assignedMembers = response.data.map(member => member.userId);
          console.log("[TicketFields] Assigned members (userId):", assignedMembers);
          // Pré-remplir le champ assigned avec les userId de tous les membres
          setTicket(prevTicket => ({
            ...prevTicket,
            assigned: assignedMembers
          }));
        } else if (context === "program" && programId) {
          // Si vous avez une route spécifique pour les participants d'un programme, utilisez-la
          const response = await axios.get(`/api/company/${organization}/program/${programId}/participants`);
          console.log("[TicketFields] Participants récupérés pour le programme", programId, "de l'organisation", organization, ":", response.data);
          setMembers(response.data || []);
          const assignedParticipants = response.data.map(participant => participant.userId);
          console.log("[TicketFields] Assigned participants (userId):", assignedParticipants);
          setTicket(prevTicket => ({
            ...prevTicket,
            assigned: assignedParticipants,
            programName: programName || '',
            programId: programId || ''
          }));
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des membres:', error);
      }
    };
  
    fetchMembers();
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
        userId: user ? user.pseudo : ''
      }
    };

    axios.post('/api/tickets', ticketData)
      .then(response => {
        console.log('Ticket ajouté:', response.data);
        // Réinitialisation des champs après ajout du ticket
        setTicket({
          detail: '',
          type: '',
          comments: '',
          rule: '',
          ticketNumber: '',
          title: '',
          organization: organization || '',
          request: '',
          assigned: members.map(member => member.userId),
          subscribers: [],
          markers: '',
          priority: '',
          creationDate: new Date().toLocaleDateString(),
          userId: user ? user.pseudo : '',
          programName: programName || '',
          programId: programId || '',
          status: 'mis en attente'
        });
      })
      .catch(error => {
        console.error('Erreur lors de l\'ajout du ticket:', error);
      });
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
            value={ticket.creationDate}
            readOnly
          />
        </div>
        <button onClick={handleSubmit}>Ajouter le Ticket</button>
      </div>
    </div>
  );
};

export default TicketFields;