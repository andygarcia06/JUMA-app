import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

import './style.css';

const TicketList = ({ companyName, user, context = "default" }) => {
  const [createdTickets, setCreatedTickets] = useState([]); // Tickets créés par l'utilisateur
  const [assignedOrSubscribedTickets, setAssignedOrSubscribedTickets] = useState([]); // Tickets où l'utilisateur est assigné ou abonné
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      console.error("Données utilisateur manquantes");
      return;
    }

    axios.get('http://localhost:3001/api/tickets')
      .then(response => {
        console.log("Tickets reçus :", response.data);

        let userCreatedTickets = [];
        let userAssignedOrSubscribedTickets = [];

        if (context === "company") {
          // Filtrer par utilisateur et compagnie
          userCreatedTickets = response.data.filter(
            ticket => ticket.userId === user.userId && ticket.organization === companyName
          );

          userAssignedOrSubscribedTickets = response.data.filter(
            ticket =>
              (ticket.assigned.includes(user.userId) || ticket.subscribers.includes(user.userId)) &&
              ticket.organization === companyName
          );
        } else if (context === "default") {
          // Filtrer uniquement par utilisateur
          userCreatedTickets = response.data.filter(ticket => ticket.userId === user.userId);

          userAssignedOrSubscribedTickets = response.data.filter(
            ticket => ticket.assigned.includes(user.userId) || ticket.subscribers.includes(user.userId)
          );
        }

        setCreatedTickets(userCreatedTickets);
        setAssignedOrSubscribedTickets(userAssignedOrSubscribedTickets);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des tickets :', error);
      });
  }, [user, companyName, context]);

  const handleTicketClick = (ticketId) => {
    console.log("Ticket cliqué avec ID :", ticketId);
    navigate(`/ticket-entry/${ticketId}`, { state: { userId: user.userId } });
  };

  return (
<div className="ticket-container">
  <h3>
    Liste des Tickets {context === "company" ? `pour ${companyName}` : ""}
    {context === "program" ? `du programme ${programName}` : ""}
  </h3>
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
  {context === "default" && (
    <div>
      <p>Affichage par défaut des tickets pour l'utilisateur actuel.</p>
    </div>
  )}
</div>

  );
};

export default TicketList;
