import React, { useState, useEffect } from 'react';
import TicketCreator from '../TicketGestion/TicketCreator/TicketCreator';
import TicketList from '../TicketGestion/TicketList/TicketList';

const DashboardTickets = ({ companyName, user, programId, context = "default" }) => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/tickets'); // API des tickets
        const allTickets = await response.json();

        // Filtrer les tickets en fonction du contexte
        let filteredTickets = [];
        if (context === "company") {
          // Filtrer par utilisateur et compagnie
          filteredTickets = allTickets.filter(ticket => 
            ticket.userId === user.userId && ticket.organization === companyName
          );
        } else if (context === "program") {
          // Filtrer par utilisateur, compagnie et programme
          filteredTickets = allTickets.filter(ticket => 
            ticket.userId === user.userId && 
            ticket.organization === companyName &&
            ticket.programId === programId
          );
        } else {
          // Par défaut, uniquement par utilisateur
          filteredTickets = allTickets.filter(ticket => ticket.userId === user.userId);
        }

        setTickets(filteredTickets);
      } catch (error) {
        console.error("Erreur lors de la récupération des tickets :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [context, user, companyName, programId]);

  if (!user || !companyName) {
    return (
      <div>
        <h2>Erreur</h2>
        <p>Les informations nécessaires sont manquantes. Veuillez vous reconnecter.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-ticketing">
      <h2>Dashboard de Ticketing pour {companyName}</h2>
      <div className="ticket-creator-section">
        <TicketCreator user={user} organization={companyName} />
      </div>
      <div className="ticket-list-section">
        {isLoading ? (
          <p>Chargement des tickets...</p>
        ) : (
          <TicketList user={user} tickets={tickets} />
        )}
      </div>
    </div>
  );
};

export default DashboardTickets;
