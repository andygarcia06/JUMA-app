import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import UserProfile from '../UserProfile/UserProfile';

import './style.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false); // État initial false
  
  const user = useSelector((state) => state.user.userData);
  console.log(user);

  // Fonction pour gérer le clic sur l'icône des tickets
  const handleTicketsClick = () => {
    navigate('/dashboardticketing', { state: { user } });
  };

  // Fonction pour gérer le clic sur l'icône des récompenses
  const handleRewardsClick = () => {
    navigate('/rewards', { state: { user } });
  };

  // Fonction pour gérer le clic sur l'icône des entreprises
  const handleCompaniesClick = () => {
    navigate('/companies', { state: { user } });
  };

  const handleValidationClick = () => {
    navigate('/validation-companies'); // Rediriger vers la page de validation
  };

  // Fonction pour gérer le clic sur l'icône des projets
  const handleProjectsClick = () => {
    navigate('/gestion-de-projets',{ state: { user } });
  };

  // Utilise useEffect pour déterminer si l'utilisateur est administrateur
  useEffect(() => {
    if (user && user.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]); // Assurez-vous de dépendre de 'user'

  console.log("Données de l'utilisateur :", user); // Ajout de console.log pour afficher les données utilisateur

  return (
    <div className="dashboard">
      <UserProfile pseudo={user?.pseudo || 'Pseudo inconnu'} />
      <nav className="dashboard-icons">
        {/* Icône pour les tickets */}
        <div className="icon-item" onClick={handleTicketsClick}>
          <span className="material-icons-outlined">description</span>
          <p>Gestion des connaissances</p>
        </div>
        {/* Icône pour les entreprises */}
        <div className="icon-item" onClick={handleCompaniesClick}>
          <span className="material-icons-outlined">business</span>
          <p>Entreprises</p>
        </div>
        {/* Icône pour les récompenses */}
        <div className="icon-item" onClick={handleRewardsClick}>
          <span className="material-icons-outlined">verified</span>
          <p>Récompenses</p>
        </div>
          <div className="icon-item" onClick={handleProjectsClick}>
            <span className="material-icons-outlined">group</span>
            <p>Gestion de projets</p>
          </div>
        {isAdmin && (
          // Afficher le composant de validation uniquement pour les administrateurs
          <div className="icon-item" onClick={handleValidationClick}>
            <span className="material-icons-outlined">check_circle</span>
            <p>Validation</p>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Dashboard;
