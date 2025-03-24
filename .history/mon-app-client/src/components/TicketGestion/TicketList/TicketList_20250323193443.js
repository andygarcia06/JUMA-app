import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MeteoTickets from '../../MeteoTickets/MeteoTickets';
import './style.css';

const TicketList = ({ companyName, user, programId, context = "default" }) => {
  const [createdTickets, setCreatedTickets] = useState([]); // Tickets créés par l'utilisateur
  const [assignedOrSubscribedTickets, setAssignedOrSubscribedTickets] = useState([]); // Tickets où l'utilisateur est assigné ou abonné
  const [filter, setFilter] = useState('all'); // Filtre de statut sélectionné
  const [timeFilter, setTimeFilter] = useState('all'); // Filtre temporel
  const [ticketMeteo, setTicketMeteo] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      console.error("Données utilisateur manquantes");
      return;
    }
  
    axios.get('/api/tickets')
      .then(response => {
        console.log("Tickets reçus :", response.data);

        // Utiliser le pseudo pour filtrer
        const userIdentifier = user.pseudo;
        console.log("User identifier used for filtering:", userIdentifier);
  
        let userCreatedTickets = [];
        let userAssignedOrSubscribedTickets = [];
  
        if (context === "company") {
          userCreatedTickets = response.data.filter(
            ticket => ticket.userId === userIdentifier && ticket.organization === companyName
          );
  
          userAssignedOrSubscribedTickets = response.data.filter(
            ticket =>
              (ticket.assigned.includes(userIdentifier) || ticket.subscribers.includes(userIdentifier)) &&
              ticket.organization === companyName
          );
        } else if (context === "program") {
          userCreatedTickets = response.data.filter(
            ticket => 
              ticket.userId === userIdentifier &&
              ticket.organization === companyName &&
              ticket.programId === programId
          );
  
          userAssignedOrSubscribedTickets = response.data.filter(
            ticket =>
              (ticket.assigned.includes(userIdentifier) || ticket.subscribers.includes(userIdentifier)) &&
              ticket.organization === companyName &&
              ticket.programId === programId
          );
        } else if (context === "default") {
          userCreatedTickets = response.data.filter(
            ticket => ticket.userId === userIdentifier
          );
          userAssignedOrSubscribedTickets = response.data.filter(
            ticket => ticket.assigned.includes(userIdentifier) || ticket.subscribers.includes(userIdentifier)
          );
        }
  
        setCreatedTickets(userCreatedTickets);
        setAssignedOrSubscribedTickets(userAssignedOrSubscribedTickets);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des tickets :', error);
      });
  }, [user, companyName, programId, context]);

  const handleTicketClick = (ticketId) => {
    console.log("Ticket cliqué avec ID :", ticketId);
    // Passer le pseudo dans l'état de navigation
    navigate(`/ticket-entry/${ticketId}`, { state: { user: user } });
  };

  const getTicketBackgroundColor = (meteo) => {
    if (!meteo) return "grey-background"; // Par défaut gris
  
    const meteoMapping = {
      "☀️ Positive": "green-background",
      "🌤 Neutre": "yellow-background",
      "🌧 Négative": "red-background"
    };
  
    return meteoMapping[meteo] || "grey-background";
  };

  // Fonctions pour déterminer le statut des tickets
  const isOpen = (ticket) => {
    const today = new Date().toLocaleDateString('fr-FR');
    return ticket.creationDate === today && ticket.pendingValidationTicket !== 'validated';
  };

  const isPending = (ticket) => {
    const today = new Date();
    const [day, month, year] = ticket.creationDate.split('/');
    const creationDate = new Date(year, month - 1, day);
    const diffTime = today - creationDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 1 && ticket.pendingValidationTicket === 'mis en attente';
  };

  const isClosed = (ticket) => {
    return ticket.pendingValidationTicket === 'validated';
  };

  // Fonction pour filtrer les tickets en fonction du filtre sélectionné
  const filterTickets = (tickets) => {
    return tickets.filter(ticket => {
      const [day, month, year] = ticket.creationDate.split('/');
      const creationDate = new Date(year, month - 1, day);
      const now = new Date();

      // Filtre temporel
      switch (timeFilter) {
        case 'today':
          if (creationDate.toDateString() !== now.toDateString()) return false;
          break;
        case 'thisWeek':
          const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
          if (creationDate < startOfWeek || creationDate > endOfWeek) return false;
          break;
        case 'thisMonth':
          if (creationDate.getMonth() !== now.getMonth() || creationDate.getFullYear() !== now.getFullYear()) return false;
          break;
        case 'thisYear':
          if (creationDate.getFullYear() !== now.getFullYear()) return false;
          break;
        default:
          break;
      }

      // Filtre de statut
      switch (filter) {
        case 'open':
          return isOpen(ticket);
        case 'pending':
          return isPending(ticket);
        case 'closed':
          return isClosed(ticket);
        case 'all':
        default:
          return true;
      }
    });
  };

  return (
    <div className="ticket-container">
      <h3>
        Liste des Tickets {context === "company" ? `pour ${companyName}` : ""}
        {context === "program" ? `du programme ${programId}` : ""}
      </h3>
      <MeteoTickets assignedTickets={assignedOrSubscribedTickets} />

      <div className="time-filter">
        <label htmlFor="timeFilter">Filtrer par période : </label>
        <select id="timeFilter" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
          <option value="all">Toutes les périodes</option>
          <option value="today">Aujourd'hui</option>
          <option value="thisWeek">Cette semaine</option>
          <option value="thisMonth">Ce mois-ci</option>
          <option value="thisYear">Cette année</option>
        </select>
      </div>
      <div className="filter-buttons">
        <button onClick={() => setFilter('all')}>Tous</button>
        <button onClick={() => setFilter('open')}>Ouverts</button>
        <button onClick={() => setFilter('pending')}>En attente</button>
        <button onClick={() => setFilter('closed')}>Fermés</button>
      </div>
      <div className="ticket-section">
        <h4>Tickets Créés</h4>
        {filterTickets(createdTickets).length > 0 ? (
          filterTickets(createdTickets).map(ticket => (
            <div 
              key={ticket.id} 
              className={`ticket-card ${getTicketBackgroundColor(ticket.meteo)}`}  
              onClick={() => handleTicketClick(ticket.id)}
            >
              <span className="ticket-user">{ticket.userId}</span>
              <h5>{ticket.title || "Sans titre"}</h5>
              <p>{ticket.detail || "Pas de détails"}</p>
              <span className="ticket-status">{ticket.pendingValidationTicket}</span>
            </div>
          ))
        ) : (
          <p>Aucun ticket créé trouvé pour le filtre sélectionné.</p>
        )}
      </div>
      <div className="ticket-section">
        <h4>Tickets Assignés ou Abonnés</h4>
        {filterTickets(assignedOrSubscribedTickets).length > 0 ? (
          filterTickets(assignedOrSubscribedTickets).map(ticket => (
            <div 
              key={ticket.id} 
              className={`ticket-card ${getTicketBackgroundColor(ticket.meteo)}`} 
              onClick={() => handleTicketClick(ticket.id)}
            >
              <span className="ticket-user">{ticket.userId}</span>
              <h5>{ticket.title || "Sans titre"}</h5>
              <p>{ticket.detail || "Pas de détails"}</p>
              <span className="ticket-status">{ticket.pendingValidationTicket}</span>
            </div>
          ))
        ) : (
          <p>Aucun ticket assigné ou abonné trouvé pour le filtre sélectionné.</p>
        )}
      </div>
      {context === "default" && (
        <div>
          <p>Affichage par défaut des tickets pour l'utilisateur actuel.</p>
        </div>
      )}
    </div>
  );
};

export default TicketList;
