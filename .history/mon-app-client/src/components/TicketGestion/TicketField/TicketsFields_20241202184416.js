import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './style.css';

const TicketFields = () => {
  const location = useLocation();
  const { user, organization } = location.state || {}; // Récupérer user et organization depuis l'état

  console.log("Données reçues dans TicketFields:", { user, organization });

  const [ticket, setTicket] = useState({
    detail: '',
    type: '',
    comments: '',
    rule: '',
    ticketNumber: '',
    title: '',
    organization: organization || '', // Pré-rempli avec organization
    request: '',
    assigned: [], // Tous les membres de l'organisation
    subscribers: [], // Modifiable par l'utilisateur
    markers: '',
    priority: '',
    creationDate: new Date().toLocaleDateString(),
    userId: user ? user.userId : '' // Pré-rempli avec l'userId
  });

  const [members, setMembers] = useState([]); // Membres de la compagnie

  // Récupération des membres de la compagnie au montage
  useEffect(() => {
    axios.get('http://localhost:3001/api/all-companies')
      .then(response => {
        console.log('Données des entreprises récupérées:', response.data);

        // Trouver la compagnie correspondante à `organization`
        const selectedCompany = response.data.find(company => company.companyName === organization);
        if (selectedCompany) {
          setMembers(selectedCompany.members || []);
          // Ajouter automatiquement tous les membres à `assigned`
          setTicket(prevTicket => ({
            ...prevTicket,
            assigned: selectedCompany.members.map(member => member.userId)
          }));
        }
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des données des entreprises:', error);
      });
  }, [organization]);

  // Gestion des abonnés
  const handleSubscriberChange = (e) => {
    const selectedSubscribers = Array.from(e.target.selectedOptions, option => option.value);
    setTicket({ ...ticket, subscribers: selectedSubscribers });
  };

  const handleProgramChange = (program) => {
    setTicket(prevTicket => ({
      ...prevTicket,
      program
    }));
  };
  

  // Gestion des changements de champs du ticket
  const handleFieldChange = (field, value) => {
    setTicket({ ...ticket, [field]: value });
  };

  // Soumission du ticket
  const handleSubmit = () => {
    const ticketData = {
      user,
      ticket: {
        ...ticket,
        userId: user ? user.userId : ''
      }
    };

    axios.post('http://localhost:3001/api/tickets', ticketData)
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
          assigned: members.map(member => member.userId), // Recharger les membres assignés
          subscribers: [],
          markers: '',
          priority: '',
          creationDate: new Date().toLocaleDateString(),
          userId: user ? user.userId : '',
          program: '',
          project: '',
          lot: '',
          br: '',
          phase: ''
        });
      })
      .catch(error => {
        console.error('Erreur lors de l\'ajout du ticket:', error);
      });
  };

  return (
    <div className='ticket-container'>
      <div className="ticket-fields ticket-section" id='ticket-fields'>
        <h3>Champ</h3>
        <div className="ticket-field">
          <label>Nom</label>
          <input
            type="text"
            value={ticket.title}
            onChange={(e) => handleFieldChange('detail', e.target.value)}
          />
        </div>
        <div className="ticket-field">
          <label>Detail:</label>
          <input
            type="text"
            value={ticket.detail}
            onChange={(e) => handleFieldChange('detail', e.target.value)}
          />
        </div>
        <div className="ticket-field">
          <label>Type:</label>
          <input
            type="text"
            value={ticket.type}
            onChange={(e) => handleFieldChange('type', e.target.value)}
          />
        </div>
        <div className="ticket-field">
          <label>Commentaires:</label>
          <textarea
            value={ticket.comments}
            onChange={(e) => handleFieldChange('comments', e.target.value)}
          />
        </div>
        <div className="ticket-field">
          <label>Regle de gestion:</label>
          <textarea
            value={ticket.rule}
            onChange={(e) => handleFieldChange('rule', e.target.value)}
          />
        </div>
        <div className="ticket-field">
          <label>Organisation:</label>
          <input
            type="text"
            value={ticket.organization}
            readOnly // Champ non modifiable
          />
        </div>
        <div className="ticket-field">
          <label>Assigné:</label>
          <textarea
            value={members.map(member => member.email).join(', ')} // Affiche la liste des membres assignés
            readOnly
          />
        </div>
        <div className="ticket-field">
          <label>Abonnés:</label>
          <select
            multiple
            value={ticket.subscribers}
            onChange={handleSubscriberChange}
          >
            {members.map(member => (
              <option key={member.userId} value={member.userId}>{member.email}</option>
            ))}
          </select>
        </div>
        <div className="ticket-field">
          <label>Demande:</label>
          <input
            type="text"
            value={ticket.request}
            onChange={(e) => handleFieldChange('request', e.target.value)}
          />
        </div>
        <div className="ticket-field">
          <label>Marqueurs:</label>
          <input
            type="text"
            value={ticket.markers}
            onChange={(e) => handleFieldChange('markers', e.target.value)}
          />
        </div>
        <div className="ticket-field">
          <label>Priorité:</label>
          <input
            type="text"
            value={ticket.priority}
            onChange={(e) => handleFieldChange('priority', e.target.value)}
          />
        </div>
        <div className="ticket-field">
          <label>Date de création:</label>
          <input
            type="text"
            value={ticket.creationDate}
            readOnly
          />
        </div>
        <button onClick={handleSubmit}>Ajouter</button>
      </div>
    </div>
  );
};

export default TicketFields;
