import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './style.css';

const TicketFields = ({ handleAddTicket }) => {
  const location = useLocation();
  const { user } = location.state || {};
  console.log("Données de l'utilisateur dans TicketFields:", user);

  const [ticket, setTicket] = useState({
    detail: '',
    type: '',
    comments: '',
    rule: '',
    ticketNumber: '',
    title: '',
    organization: '', // Utilisé pour stocker le nom de l'entreprise sélectionnée
    request: '',
    assigned: [], // Utilisé pour stocker les membres assignés
    subscribers: [], // Utilisé pour stocker les abonnés
    markers: '',
    priority: '',
    creationDate: new Date().toLocaleDateString(),
    userId: user ? user.userId : ''
  });

  const [companies, setCompanies] = useState([]);
  const [members, setMembers] = useState([]);
  const [assignableMembers, setAssignableMembers] = useState([]);

  useEffect(() => {
    // Effectuer la requête GET pour récupérer les données des entreprises
    axios.get('http://localhost:3001/api/all-companies')
      .then(response => {
        console.log('Données des entreprises récupérées:', response.data);
        setCompanies(response.data);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des données des entreprises:', error);
      });
  }, []); // Le tableau vide [] en second argument indique que ce useEffect s'exécutera une seule fois après le premier rendu

  const handleOrganizationChange = (value) => {
    // Réinitialiser les membres lorsque l'organisation est changée
    const selectedCompany = companies.find(company => company.companyName === value);
    if (selectedCompany) {
      setMembers(selectedCompany.members || []); // Utilisation de setMembers avec un tableau vide par défaut si members est undefined
      setAssignableMembers(selectedCompany.members || []); // Réinitialiser également les membres assignables
    } else {
      setMembers([]);
      setAssignableMembers([]);
    }

    // Mettre à jour l'état du ticket avec l'entreprise sélectionnée
    setTicket({ ...ticket, organization: value, subscribers: [], assigned: [] }); // Réinitialiser les abonnés et l'assigné lors du changement d'organisation
  };

  const handleAssignedChange = (e) => {
    const selectedAssigned = Array.from(e.target.closest('.checkbox-group').querySelectorAll('input[type="checkbox"]:checked'))
      .map(checkbox => checkbox.value);
    setTicket({ ...ticket, assigned: selectedAssigned });
  };

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
          organization: '',
          request: '',
          assigned: [],
          subscribers: [],
          markers: '',
          priority: '',
          creationDate: new Date().toLocaleDateString(),
          userId: user ? user.userId : ''
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
          <label>Numero de ticket:</label>
          <input
            type="text"
            value={ticket.ticketNumber}
            onChange={(e) => handleFieldChange('ticketNumber', e.target.value)}
          />
        </div>
        <div className="ticket-field">
          <label>Titre du ticket:</label>
          <input
            type="text"
            value={ticket.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
          />
        </div>
        <div className="ticket-field">
          <label>Organisation:</label>
          <select
            value={ticket.organization}
            onChange={(e) => handleOrganizationChange(e.target.value)}
          >
            <option value="">Sélectionnez une organisation</option>
            {companies.map(company => (
              <option key={company.id} value={company.companyName}>{company.companyName}</option>
            ))}
          </select>
        </div>
        <div className="ticket-field">
          <label>Assigné:</label>
          <div className="checkbox-group">
            {assignableMembers.map(member => (
              <div key={member.userId} className="checkbox-item">
                <input
                  type="checkbox"
                  id={member.userId}
                  value={member.userId}
                  checked={ticket.assigned.includes(member.userId)}
                  onChange={handleAssignedChange}
                />
                <label htmlFor={member.userId}>{member.email}</label>
              </div>
            ))}
          </div>
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
