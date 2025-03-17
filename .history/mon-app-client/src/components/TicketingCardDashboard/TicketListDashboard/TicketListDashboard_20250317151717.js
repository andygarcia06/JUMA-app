import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './style.css';
import MeteoTickets from '../../MeteoTickets/MeteoTickets';


const UserTickets = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all'); // Filtre de statut sélectionné
  const [timeFilter, setTimeFilter] = useState('all'); // Filtre temporel
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      console.error("Données utilisateur manquantes");
      return;
    }

    axios.get('/api/tickets')
      .then(response => {
        console.log("Tickets reçus :", response.data);

        // Filtrer les tickets où l'utilisateur est le créateur ou est assigné
        const userTickets = response.data.filter(
          ticket => (ticket.userId === user.userId || (ticket.user && ticket.user.userId === user.userId) || ticket.assigned.includes(user.userId))
        );
        console.log("✅ Données utilisateur dans UserTickets :", user);
        console.log("✅ UserId utilisé pour le filtrage :", user.userId);


        

        setTickets(userTickets);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des tickets :', error);
      });
  }, [user]);

  const handleTicketClick = (ticketId) => {
    console.log("Ticket cliqué avec ID :", ticketId);
    navigate(`/ticket-entry/${ticketId}`, { state: { userId: user.userId } });
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

      // Appliquer le filtre temporel
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

      // Appliquer le filtre de statut
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
      <h3>Liste des Tickets</h3>
      <div className="time-filter">
        <label htmlFor="timeFilter">Filtrer par période : </label>
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
        {filterTickets(tickets).length > 0 ? (
          filterTickets(tickets).map(ticket => (
            <div key={ticket.id} className="ticket-card" onClick={() => handleTicketClick(ticket.id)}>
              <span className="ticket-user">{ticket.userId}</span>
              <h5>{ticket.title || "Sans titre"}</h5>
              <p>{ticket.detail || "Pas de détails"}</p>
              <span className="ticket-status">{ticket.pendingValidationTicket}</span>
            </div>
          ))
        ) : (
          <p>Aucun ticket trouvé pour le filtre sélectionné.</p>
        )}
      </div>
    </div>
  );
};

export default UserTickets;
