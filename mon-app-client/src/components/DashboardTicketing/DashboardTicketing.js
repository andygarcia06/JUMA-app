import React from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './DashboardTicketing.css'; // Importez votre fichier CSS pour le style

const DashboardTicketing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location || {};
  const user = state ? state.user : null;

  const handleTicketsClick = () => {
    navigate('/support-ticket', { state: { user } });
  };

  const handleKnowledgeClick = () => {
    navigate('/knowledge-management', { state: { user } });
  };

  console.log("Données de l'utilisateur dans DashboardTicketing :", user);

  return (
    <div>
      <h1>Tableau de bord Ticketing</h1>
      <div className="sidebar">
        <nav>
          <ul>
            <li>
              {/* Lien vers SupportTicketing avec les données utilisateur transmises */}
              <button onClick={handleTicketsClick}>
                Support Ticketing
              </button>
            </li>
            <li>
              <button onClick={handleKnowledgeClick}>
                Gestion des connaissances
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <div className="content">
        {/* Contenu spécifique au composant */}
      </div>
    </div>
  );
};

export default DashboardTicketing;
