import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TicketCreator from '../TicketGestion/TicketCreator/TicketCreator';
import TicketListDashboard from './TicketListDashboard/TicketListDashboard';

const TicketingCardDashboard = (props) => {
  const location = useLocation();
  const user = props.user || location.state?.user;
  const context = props.context || location.state?.context || "default";

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user || !user.userId) {
        console.error("❌ Erreur : l'utilisateur n'est pas défini ou l'ID utilisateur est manquant.");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/tickets');
        if (!response.ok) throw new Error("Problème avec la requête API");

        const allTickets = await response.json();

        // Filtrer les tickets créés par l'utilisateur ou auxquels il est assigné
        const filteredTickets = allTickets.filter(ticket =>
            (ticket.user?.userId === user.userId || ticket.userId === user.userId) ||
            ticket.assigned.includes(user.userId)
          );

        setTickets(filteredTickets);
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des tickets :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  if (!user) {
    return (
      <div>
        <h2>Erreur</h2>
        <p>❌ Les informations nécessaires sont manquantes. Veuillez vous reconnecter.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-ticketing">
      <h2>🎫 Tableau de bord des tickets</h2>
      <div className="ticket-creator-section">
        <TicketCreator user={user} context={context} />
      </div>
      <div className="ticket-list-section">
        {isLoading ? (
          <p>⏳ Chargement des tickets...</p>
        ) : (
          <TicketListDashboard user={user} context={context} tickets={tickets} />
        )}
      </div>
    </div>
  );
};

export default TicketingCardDashboard;
