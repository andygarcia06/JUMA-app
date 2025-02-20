import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import TicketingCardDashboard from '../TicketingCardDashboard/TicketingCardDashboard';
import './style.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  const user = useSelector((state) => state.user.userData);
  console.log("Données de l'utilisateur :", user);

  // Fonctions de navigation
  const handleTicketsClick = () => {
    navigate('/knowledge-management', { state: { user } });
  };
  const handleRewardsClick = () => {
    navigate('/rewards', { state: { user } });
  };
  const handleCompaniesClick = () => {
    navigate('/companies', { state: { user } });
  };
  const handleValidationClick = () => {
    navigate('/validation-companies');
  };
  const handleProjectsClick = () => {
    navigate('/gestion-de-projets', { state: { user } });
  };
  const handleTicketClick = () => {
    navigate('/dashboardtickets', { state: { user, context: 'default' } });
  };
  const handleUpgradeUserClick = () => {
    navigate('/upgrade-user', { state: { user } });
  };

  // Navigation vers la page de profil
  const handleProfileClick = () => {
    navigate('/profile', { state: { user } });
  };

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    setIsAdmin(user?.role === 'admin');
  }, [user]);

  return (
    <div className="dashboard">
      {/* Barre latérale à gauche */}
      <nav className="dashboard-icons">
        <div className="icon-item" onClick={handleTicketsClick}>
          <span className="material-icons-outlined">description</span>
          <p>Micro Learning</p>
        </div>
        <div className="icon-item" onClick={handleCompaniesClick}>
          <span className="material-icons-outlined">business</span>
          <p>Companies</p>
        </div>
        <div className="icon-item" onClick={handleRewardsClick}>
          <span className="material-icons-outlined">verified</span>
          <p>Rewards</p>
        </div>
        <div className="icon-item" onClick={handleProjectsClick}>
          <span className="material-icons-outlined">group</span>
          <p>Gestion de projets</p>
        </div>
        {isAdmin && (
          <div className="icon-item" onClick={handleValidationClick}>
            <span className="material-icons-outlined">check_circle</span>
            <p>Validation</p>
          </div>
        )}
      </nav>

      {/* Contenu principal à droite */}
      <div className="dashboard-overlay">
        {/* Exemple : un bouton Upgrade User */}
        <button className="upgrade-user-button" onClick={handleUpgradeUserClick}>
          <span className="material-icons-outlined">system_update_alt</span>
          <p>Upgrade User</p>
        </button>

        {/* Carte des tickets (ou autre contenu) */}
        <TicketingCardDashboard user={user} context="company" />
      </div>

      {/* Icône de profil en haut à droite */}
      <div className="user-profile-icon" onClick={handleProfileClick}>
        <span className="material-icons-outlined">account_circle</span>
        <p>{user?.pseudo || 'Profil'}</p>
      </div>
    </div>
  );
};

export default Dashboard;
