import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Import des 4 composants dynamiques
import DashboardConsultedCourses from './DashboardConsultedCourses/DashboardConsultedCourses';
import DashboardProjectAssigned from './DashboardProjectAssigned/DashboardProjectAssigned';
import DashboardValidatedCourses from './DashboardValidatedCourses/DashboardValidatedCourses';
import DashboardRewardsGets from './DashboardRewardsGets/DashboardRewardsGets';

import TicketingCardDashboard from '../TicketingCardDashboard/TicketingCardDashboard';
import './style.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  // Liste des blocs dynamiques
  const [blocks, setBlocks] = useState([]);

  const user = useSelector((state) => state.user.userData);
  console.log("Données de l'utilisateur:", user);

  // ------------------- Navigation / Menus latéraux -------------------
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
  const handleProfileClick = () => {
    navigate('/profile', { state: { user } });
  };

  // ------------------- Vérifier le rôle admin -------------------
  useEffect(() => {
    if (user && user.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // ------------------- Gestion des blocs dynamiques -------------------
  // Ajouter un bloc
  const handleAddBlock = () => {
    const newBlock = {
      id: Date.now(),
      componentType: "" // Par défaut, pas de composant sélectionné
    };
    setBlocks([...blocks, newBlock]);
  };

  // Supprimer un bloc
  const handleCloseBlock = (id) => {
    setBlocks((prev) => prev.filter(block => block.id !== id));
  };

  // Changer le type de composant d'un bloc
  const handleChangeComponent = (blockId, newType) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === blockId ? { ...block, componentType: newType } : block
      )
    );
  };

  return (
    <div className="dashboard">
      {/* Barre latérale */}
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

      {/* Contenu principal */}
      <div className="dashboard-overlay">
        {/* Section en haut à droite : Profil + Upgrade User */}
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

        {/* Exemple : TicketingCardDashboard déjà existant */}
        <TicketingCardDashboard user={user} context="company" />

        {/* Container pour les blocs dynamiques */}
        <div className="blocks-container">
        {blocks.map((block) => {
  const isChosen = block.componentType !== "";

  return (
    <div
      className={`my-block ${isChosen ? 'chosen' : ''}`}
      key={block.id}
    >
      <button className="close-button" onClick={() => handleCloseBlock(block.id)}>
        X
      </button>

      {/* On n'affiche le <select> que si on n'a pas encore choisi */}
      {!isChosen && (
        <select
          className="component-select"
          value={block.componentType}
          onChange={(e) => handleChangeComponent(block.id, e.target.value)}
        >
          <option value="">-- Choisir un composant --</option>
          <option value="consulted">Courses Consultés</option>
          <option value="assigned">Projets Assignés</option>
          <option value="validated">Cours Validés</option>
          <option value="rewards">Rewards</option>
        </select>
      )}

      {/* Zone d'affichage du composant */}
      <div className="block-content">
        {block.componentType === 'consulted' && <DashboardConsultedCourses user={user} />}
        {block.componentType === 'assigned' && <DashboardProjectAssigned user={user} />}
        {block.componentType === 'validated' && <DashboardValidatedCourses user={user} />}
        {block.componentType === 'rewards' && <DashboardRewardsGets user={user} />}
      </div>
    </div>
  );
})}


          {/* Le bouton “+” pour ajouter un nouveau bloc */}
          <div className="plus-box" onClick={handleAddBlock}>
            <span className="plus-icon">+</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
