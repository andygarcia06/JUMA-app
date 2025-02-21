import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import UserProfile from '../UserProfile/UserProfile';
import TicketingCardDashboard from '../TicketingCardDashboard/TicketingCardDashboard';
import './style.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [blocks, setBlocks] = useState([]);

  // Fonction pour ajouter un bloc
  const handleAddBlock = () => {
    // On crée un bloc avec un id unique
    const newBlock = { id: Date.now() };
    setBlocks([...blocks, newBlock]);
  };

  // Fonction pour fermer (supprimer) un bloc
  const handleCloseBlock = (id) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  
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

  const handleProfileClick = () => {
    navigate('/profile',{ state: {user}});
  }

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
       <nav className="dashboard-icons">
       <div className="icon-item" onClick={handleProjectsClick}>
          <span className="material-icons-outlined">account_circle</span>
          <p>{user?.pseudo || 'Profil'}</p>
        </div>
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
            <p>Validation Companies</p>
          </div>
        )}
      </nav>
     <div className='dashboard-overlay'>
      {/* Bouton Upgrade User en haut à droite */}
      <div className="user-connected">
      <div className="user-profile-icon" onClick={handleProfileClick}>
            <span className="material-icons-outlined">account_circle</span>
            <p>{user?.pseudo || 'Profil'}</p>
      </div> 
      <button className="upgrade-user-button" onClick={handleUpgradeUserClick}>
        <span className="material-icons-outlined">system_update_alt</span>
        <p>Upgrade User</p>
      </button>
      </div>
      
     

          {/* Passer companyName pour récupérer et afficher les tickets liés à cette entreprise */}
          <TicketingCardDashboard 
            user={user} 
            context="company" 

          />

      <div className="blocks-container">
        {/* On affiche d'abord tous les blocs... */}
        {blocks.map((block) => (
          <div className="my-block" key={block.id}>
            <button className="close-button" onClick={() => handleCloseBlock(block.id)}>
              X
            </button>
            <p>Bloc #{block.id}</p>
          </div>
        ))}

        {/* ...ensuite le bouton “+” */}
        <div className="plus-box" onClick={handleAddBlock}>
          <span className="plus-icon">+</span>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
