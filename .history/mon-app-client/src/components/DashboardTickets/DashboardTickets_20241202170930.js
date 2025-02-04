import React from 'react';
import TicketCreator from '../TicketGestion/TicketCreator/TicketCreator';
import TicketList from '../TicketGestion/TicketList/TicketList';
import { useNavigate, useLocation } from 'react-router-dom';

const DashboardTickets = (companyName) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = location.state || {}; // Récupère l'utilisateur depuis location.state

  console.log("Données de l'utilisateur dans DashboardTickets:", user);

  if (!user) {
    return (
      <div>
        <h2>Erreur</h2>
        <p>Les informations de l'utilisateur sont manquantes. Veuillez vous reconnecter.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-ticketing">
      <h2>Dashboard de Ticketing</h2>
      <div className="ticket-creator-section">
        <TicketCreator user={user} />
      </div>
      <div className="ticket-list-section">
      <TicketList user={user} companyName={companyName} />
      </div>
    </div>
  );
};

export default DashboardTickets;
