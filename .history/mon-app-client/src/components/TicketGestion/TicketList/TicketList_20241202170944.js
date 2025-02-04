import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

import './style.css';

const TicketList = ({ companyName, user }) => {
  const [createdTickets, setCreatedTickets] = useState([]); // Tickets créés par l'utilisateur
  const [assignedOrSubscribedTickets, setAssignedOrSubscribedTickets] = useState([]); // Tickets où l'utilisateur est assigné ou abonné
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !companyName) {
      console.error("Données utilisateur ou companyName manquantes");
      return;
    }

    axios.get('http://localhost:3001/api/tickets')
      .then(response => {
        console.log("Tickets reçus :", response.data);

        // Filtrer les tickets créés par l'utilisateur actuel et associés à la companyName
        const userCreatedTickets = response.data.filter(
          ticket => ticket.userId === user.userId && ticket.organization === companyName
        );
        setCreatedTickets(userCreatedTickets);

        // Filtrer les tickets où l'utilisateur est assigné ou abonné, et associés à la companyName
        const userAssignedOrSubscribedTickets = response.data.filter(
          ticket =>
            (ticket.assigned.includes(user.userId) || ticket.subscribers.includes(user.userId)) &&
            ticket.organization === companyName
        );
        setAssignedOrSubscribedTickets(userAssignedOrSubscribedTickets);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des tickets :', error);
      });
  }, [user, companyName]);

  const handleTicketClick = (ticketId) => {
    console.log("Ticket cliqué avec ID :", ticketId);
    navigate(`/ticket-entry/${ticketId}`, { state: { userId: user.userId } });
  };

  return (
    <div className="ticket-container">
      <h3>Liste des Tickets pour {companyName}</h3>
      <div className="ticket-section">
        <h4>Tickets Créés</h4>
        {createdTickets.length > 0 ? (
          createdTickets.map(ticket => (
            <div key={ticket.id} className="ticket-card" onClick={() => handleTicketClick(ticket.id)}>
              <h5>{ticket.title || "Sans titre"}</h5>
              <p>{ticket.detail || "Pas de détails"}</p>
            </div>
          ))
        ) : (
          <p>Aucun ticket créé trouvé.</p>
        )}
      </div>
      <div className="ticket-section">
        <h4>Tickets Assignés ou Abonnés</h4>
        {assignedOrSubscribedTickets.length > 0 ? (
          assignedOrSubscribedTickets.map(ticket => (
            <div key={ticket.id} className="ticket-card" onClick={() => handleTicketClick(ticket.id)}>
              <h5>{ticket.title || "Sans titre"}</h5>
              <p>{ticket.detail || "Pas de détails"}</p>
            </div>
          ))
        ) : (
          <p>Aucun ticket assigné ou abonné trouvé.</p>
        )}
      </div>
    </div>
  );
};

export default TicketList;
