import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Import de ton composant Reward
import Reward from '../Reward/Reward';

// Import de tes 4 composants dynamiques (si tu en as besoin dans d'autres blocs)
import DashboardConsultedCourses from './DashboardConsultedCourses/DashboardConsultedCourses';
import DashboardProjectAssigned from './DashboardProjectAssigned/DashboardProjectAssigned';
import DashboardValidatedCourses from './DashboardValidatedCourses/DashboardValidatedCourses';
import DashboardRewardsGets from './DashboardRewardsGets/DashboardRewardsGets';

import TicketingCardDashboard from '../TicketingCardDashboard/TicketingCardDashboard';
import './style.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  // États pour stocker les badges remontés depuis Reward
  const [creationLevel, setCreationLevel] = useState('');
  const [positiveReactionsLevel, setPositiveReactionsLevel] = useState('');
  const [allReactionsLevel, setAllReactionsLevel] = useState('');
  const [modulesValidatedLevel, setModulesValidatedLevel] = useState('');

  // Liste des blocs dynamiques (si tu as toujours besoin de ça)
  const [blocks, setBlocks] = useState([]);

  const dragItemIndex = useRef(null);

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
  const handleAddBlock = () => {
    const newBlock = {
      id: Date.now(),
      componentType: "" // Par défaut, pas de composant sélectionné
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const handleCloseBlock = (id) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
  };

  const handleChangeComponent = (blockId, newType) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === blockId ? { ...block, componentType: newType } : block
      )
    );
  };

  // ------------------- Drag & Drop -------------------
  const handleDragStart = (e, index) => {
    dragItemIndex.current = index; 
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const startIndex = dragItemIndex.current;
    if (startIndex === dropIndex) return;

    const updatedBlocks = [...blocks];
    const temp = updatedBlocks[startIndex];
    updatedBlocks[startIndex] = updatedBlocks[dropIndex];
    updatedBlocks[dropIndex] = temp;
    setBlocks(updatedBlocks);

    dragItemIndex.current = null;
  };

  // ------------------- Callbacks pour Reward -------------------
  const handleBadgeUnlockedCreateModule = (newBadge) => {
    console.log('Nouveau badge création:', newBadge);
    setCreationLevel(newBadge);
    // Optionnel : axios.post(...) pour enregistrer
  };

  const handleBadgeUnlockedPositiveReaction = (newBadge) => {
    console.log('Nouveau badge réactions positives:', newBadge);
    setPositiveReactionsLevel(newBadge);
  };

  const handleBadgeUnlockedAllReaction = (newBadge) => {
    console.log('Nouveau badge réactions totales:', newBadge);
    setAllReactionsLevel(newBadge);
  };

  const handleBadgeUnlockedModuleValidate = (newBadge) => {
    console.log('Nouveau badge modules validés:', newBadge);
    setModulesValidatedLevel(newBadge);
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

        {/* Exemple : on affiche le composant Reward ici */}
        {/* On lui passe les callbacks pour remonter les badges */}
        {/* Si tu veux l'afficher seulement en naviguant sur /rewards, retire-le d'ici. */}
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h2>Récompenses (exemple d'intégration dans Dashboard)</h2>
          <Reward
            // On reconstruit l'objet user comme dans Reward
            location={{ state: { user } }}
            onBadgeUnlockedCreateModule={handleBadgeUnlockedCreateModule}
            onBadgeUnlockedPositiveReaction={handleBadgeUnlockedPositiveReaction}
            onBadgeUnlockedAllReaction={handleBadgeUnlockedAllReaction}
            onBadgeUnlockedModuleValidate={handleBadgeUnlockedModuleValidate}
          />

          {/* On peut afficher ici les badges remontés */}
          <div style={{ marginTop: '10px' }}>
            <p>Badge Création : {creationLevel}</p>
            <p>Badge Réactions Positives : {positiveReactionsLevel}</p>
            <p>Badge Réactions Totales : {allReactionsLevel}</p>
            <p>Badge Modules Validés : {modulesValidatedLevel}</p>
          </div>
        </div>

        {/* Container pour les blocs dynamiques */}
        <div className="blocks-container">
          {blocks.map((block, index) => {
            const isChosen = block.componentType !== "";

            return (
              <div
                key={block.id}
                className={`my-block ${isChosen ? 'chosen' : ''}`}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <button
                  className="close-button"
                  onClick={() => handleCloseBlock(block.id)}
                >
                  X
                </button>

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

                <div className="block-content">
                  {block.componentType === 'consulted' && (
                    <DashboardConsultedCourses user={user} />
                  )}
                  {block.componentType === 'assigned' && (
                    <DashboardProjectAssigned user={user} />
                  )}
                  {block.componentType === 'validated' && (
                    <DashboardValidatedCourses user={user} />
                  )}
                  {block.componentType === 'rewards' && (
                    <DashboardRewardsGets user={user} />
                  )}
                </div>
              </div>
            );
          })}

          <div className="plus-box" onClick={handleAddBlock}>
            <span className="plus-icon">+</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
