import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './style.css';

const TicketList = ({ companyName, user, programId, context = "default" }) => {
  const [tickets, setTickets] = useState([]); // Tous les tickets récupérés
  const [filter, setFilter] = useState('all'); // État du filtre sélectionné
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      console.error("Données utilisateur manquantes");
      return;
    }

    axios.get('http://localhost:3001/api/tickets')
      .then(response => {
        console.log("Tickets reçus :", response.data);
        setTickets(response.data);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des tickets :', error);
      });
  }, [user]);

  const handleTicketClick = (ticketId) => {
    console.log("Ticket cliqué avec ID :", ticketId);
    navigate(`/ticket-entry/${ticketId}`, { state: { userId: user.userId } });
  };

  // Fonction pour déterminer si un ticket est "open"
  const isOpen = (ticket) => {
    const today = new Date().toLocaleDateString('fr-FR');
    return ticket.creationDate === today;
  };

  // Fonction pour déterminer si un ticket est "pending"
  const isPending = (ticket) => {
    const today = new Date();
    const creationDateParts = ticket.creationDate.split('/');
    const creationDate = new Date(creationDateParts[2], creationDateParts[1] - 1, creationDateParts[0]);
    const diffTime = today - creationDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 1 && ticket.pendingValidationTicket === 'mis en attente';
  };

  // Fonction pour déterminer si un ticket est "closed"
  const isClosed = (ticket) => {
    return ticket.pendingValidationTicket === 'validated';
  };

  // Filtrer les tickets en fonction du filtre sélectionné
  const filteredTickets = tickets.filter(ticket => {
    if (context === "company" && ticket.organization !== companyName) return false;
    if (context === "program" && ticket.programId !== programId) return false;
    if (context === "default" && ticket.userId !== user.userId) return false;

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

  return (
    <div className="ticket-container">
      <h3>
        Liste des Tickets {context === "company" ? `pour ${companyName}` : ""}
        {context === "program" ? `du programme ${programId}` : ""}
      </h3>
      <div className="filter-buttons">
        <button onClick={() => setFilter('all')}>Tous</button>
        <button onClick={() => setFilter('open')}>Ouverts</button>
        <button onClick={() => setFilter('pending')}>En attente</button>
        <button onClick={() => setFilter('closed')}>Fermés</button>
      </div>
      <div className="ticket-section">
        {filteredTickets.length > 0 ? (
          filteredTickets.map(ticket => (
            <div key={ticket.id} className="ticket-card" onClick={() => handleTicketClick(ticket.id)}>
              <h5>{ticket.title || "Sans titre"}</h5>
              <p>{ticket.detail || "Pas de détails"}</p>
            </div>
          ))
        ) : (
          <p>Aucun ticket trouvé pour le filtre sélectionné.</p>
        )}
      </div>
    </div>
  );
};

export default TicketList;
