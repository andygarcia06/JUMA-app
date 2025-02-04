import React from 'react';
import TicketCreator from '../TicketGestion/TicketCreator/TicketCreator';
import TicketList from '../TicketGestion/TicketList/TicketList';
import { useNavigate, useLocation } from 'react-router-dom';

const DashboardTickets = ({ companyName, user }) => {
  if (!user || !companyName) {
    return (
      <div>
        <h2>Erreur</h2>
        <p>Les informations nécessaires sont manquantes. Veuillez vous reconnecter.</p>
      </div>
    );
  }

  console.log("Données dans DashboardTickets:", { user, companyName }); // Pour vérifier le contenu

  return (
    <div className="dashboard-ticketing">
      <h2>Dashboard de Ticketing pour {companyName}</h2>
      <div className="ticket-creator-section">
        {/* Vérifiez que `user` est un objet valide */}
        <TicketCreator user={user} organization={companyName} />
      </div>
      <div className="ticket-list-section">
        {/* Vérifiez que `companyName` est une chaîne */}
        <TicketList user={user} companyName={companyName} />
      </div>
    </div>
  );
};