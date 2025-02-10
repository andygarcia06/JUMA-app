import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import UserProfile from '../UserProfile/UserProfile';
import DashboardTickets from '../DashboardTickets/DashboardTickets';
import './style.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  
  const user = useSelector((state) => state.user.userData);
  console.log(user);

  // Fonctions de navigation pour les autres icônes du dashboard
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
    navigate('/validation-companies'); // Rediriger vers la page de validation
  };

  const handleProjectsClick = () => {
    navigate('/gestion-de-projets', { state: { user } });
  };

  const handleTicketClick = () => {
    console.log("Avant navigation vers dashboardtickets :", user);
    navigate('/dashboardtickets', { state: { user, context: "default" } });
  };
  

  const handleUpgradeUserClick = () => {
    navigate('/upgrade-user', { state: { user } });
  };

  // Déterminer si l'utilisateur est administrateur
  useEffect(() => {
    if (user && user.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  console.log("Données de l'utilisateur :", user);

  return (
    <div className="dashboard">
      {/* Bouton Upgrade User en haut à droite */}
      <div className="user-connected">
      <button className="upgrade-user-button" onClick={handleUpgradeUserClick}>
        <span className="material-icons-outlined">system_update_alt</span>
        <p>Upgrade User</p>
      </button>
      </div>
      
      <UserProfile pseudo={user?.pseudo || 'Pseudo inconnu'} />
      
      <nav className="dashboard-icons">
        <div className="icon-item" onClick={handleTicketsClick}>
          <span className="material-icons-outlined">description</span>
          <p>Gestion des connaissances</p>
        </div>
        <div className="icon-item" onClick={handleCompaniesClick}>
          <span className="material-icons-outlined">business</span>
          <p>Entreprises</p>
        </div>
        <div className="icon-item" onClick={handleRewardsClick}>
          <span className="material-icons-outlined">verified</span>
          <p>Récompenses</p>
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
          {/* Passer companyName pour récupérer et afficher les tickets liés à cette entreprise */}
          <DashboardTickets 
            companyId={companyId} 
            companyName={companyData.companyName} 
            user={user} 
            context="company" 

          />
    </div>
  );
};

export default Dashboard;
