import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import LeftMenu from './LeftMenu/LeftMenu';
import CreateModuleReward from './CreateModuleReward/CreateModuleReward';
import PositiveReactionReward from './PositiveReactionReward/PositiveReactionReward';
import AllReactionCourses from './AllReactionCourses/AllReactionCourses';
import CoursValideReward from './CourseValidateReward/CourseValidateReward';
import ModuleValidateRewards from './ModuleValidatedRewards/ModuleValidatedRewards';
import TrueReward from './TrueReward/TrueReward'; 
import BackButton from './BackButton/BackButton'
import './Reward.css';

const Reward = () => {
  // 1) Récupération de l’utilisateur depuis le state de navigation
  const location = useLocation();
  const user = location.state && location.state.user;

  // Utiliser le pseudo comme identifiant pour les récompenses
  const userIdentifier = user ? user.pseudo : null;

  // 2) Déclaration des hooks d'état
  const [activeComponent, setActiveComponent] = useState('Rewards');
  const [creationLevel, setCreationLevel] = useState('');
  const [positiveReactionsLevel, setPositiveReactionsLevel] = useState('');
  const [allReactionsLevel, setAllReactionsLevel] = useState('');
  const [modulesValidatedLevel, setModulesValidatedLevel] = useState('');

  // 3) Vérification de la présence de l’utilisateur
  if (!user) {
    return <div>Données utilisateur non disponibles</div>;
  }

  console.log("Données de l'utilisateur dans Rewards :", user);

  // 4) Callbacks pour les enfants
  const handleBadgeUnlockedCreateModule = (newBadge) => {
    console.log('Nouveau badge création:', newBadge);
    setCreationLevel(newBadge);
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

  // 5) Gestion du menu latéral
  const handleMenuChange = (menu) => {
    setActiveComponent(menu);
  };

  // 6) Rendu du composant actif en fonction du menu sélectionné
  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'Rewards':
        return (
          <div className="rewards-container">
            <h2>Obtenez ici des trophées de Champions</h2>
            <CreateModuleReward
              userId={userIdentifier}
              onBadgeUnlockedCreateModule={handleBadgeUnlockedCreateModule}
            />
            <PositiveReactionReward
              userId={userIdentifier}
              onBadgeUnlockedPositiveReaction={handleBadgeUnlockedPositiveReaction}
            />
            <h2>Obtenez ici des trophées d'Apprenant</h2>
            <CoursValideReward userId={userIdentifier} />
            <AllReactionCourses
              userId={userIdentifier}
              onBadgeUnlockedAllReaction={handleBadgeUnlockedAllReaction}
            />
            <ModuleValidateRewards
              userId={userIdentifier}
              onBadgeUnlockedModuleValidate={handleBadgeUnlockedModuleValidate}
            />
            <div style={{ marginTop: '20px' }}>
              <p>Badge création débloqué : {creationLevel}</p>
              <p>Badge réactions positives débloqué : {positiveReactionsLevel}</p>
              <p>Badge réactions totales débloqué : {allReactionsLevel}</p>
              <p>Badge modules validés débloqué : {modulesValidatedLevel}</p>
            </div>
          </div>
        );
      case 'TrueReward':
        return <TrueReward userId={userIdentifier} />;
      default:
        return null;
    }
  };

  // 7) Rendu final
  return (
    <div>
      <LeftMenu
        onActivateRewards={() => handleMenuChange('Rewards')}
        onActivateReduction={() => handleMenuChange('TrueReward')}
      />
      {renderActiveComponent()}
    </div>
  );
};

export default Reward;
