// Reward.js

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import LeftMenu from './LeftMenu/LeftMenu';
import CreateModuleReward from './CreateModuleReward/CreateModuleReward';
import PositiveReactionReward from './PositiveReactionReward/PositiveReactionReward';
import AllReactionCourses from './AllReactionCourses/AllReactionCourses';
import CoursValideReward from './CourseValidateReward/CourseValidateReward';
import ModuleValidateRewards from './ModuleValidatedRewards/ModuleValidatedRewards';
import TrueReward from './TrueReward/TrueReward'; 
import './Reward.css';

const Reward = () => {
  // 1) Récupération de l’utilisateur
  const location = useLocation();
  const user = location.state && location.state.user;

  // 2) Déclaration de tous les Hooks (useState) AVANT tout return conditionnel
  const [activeComponent, setActiveComponent] = useState('Rewards');

  // États pour stocker les badges débloqués depuis chaque composant
  const [creationLevel, setCreationLevel] = useState('');
  const [positiveReactionsLevel, setPositiveReactionsLevel] = useState('');
  const [allReactionsLevel, setAllReactionsLevel] = useState('');
  const [modulesValidatedLevel, setModulesValidatedLevel] = useState('');

  // 3) Vérification si l’utilisateur est disponible
  //    S'il n'y a pas de user, on fait un early return
  if (!user) {
    return <div>Données utilisateur non disponibles</div>;
  }

  console.log("Données de l'utilisateur dans Rewards :", user);

  // 4) Définition des callbacks que les composants enfants appelleront
  const handleBadgeUnlockedCreateModule = (newBadge) => {
    console.log('Nouveau badge création:', newBadge);
    setCreationLevel(newBadge);
    // Optionnel : faire un axios.post(...) si tu veux enregistrer immédiatement
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

  // 6) Fonction qui rend le composant actif en fonction de l’état
  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'Rewards':
        return (
          <div className="rewards-container">
            <h2>Obtenez ici des trophées de Champions</h2>
            <CreateModuleReward
              userId={user.userId}
              onBadgeUnlockedCreateModule={handleBadgeUnlockedCreateModule}
            />
            
            <PositiveReactionReward
              userId={user.userId}
              onBadgeUnlockedPositiveReaction={handleBadgeUnlockedPositiveReaction}
            />

            <h2>Obtenez ici des trophées d'Apprenant</h2>
            <CoursValideReward userId={user.userId} />

            <AllReactionCourses
              userId={user.userId}
              onBadgeUnlockedAllReaction={handleBadgeUnlockedAllReaction}
            />

            <ModuleValidateRewards
              userId={user.userId}
              onBadgeUnlockedModuleValidate={handleBadgeUnlockedModuleValidate}
            />

            {/* Exemple d'affichage des badges débloqués (pour debug ou résumé) */}
            <div style={{ marginTop: '20px' }}>
              <p>Badge création débloqué : {creationLevel}</p>
              <p>Badge réactions positives débloqué : {positiveReactionsLevel}</p>
              <p>Badge réactions totales débloqué : {allReactionsLevel}</p>
              <p>Badge modules validés débloqué : {modulesValidatedLevel}</p>
            </div>
          </div>
        );
      case 'TrueReward':
        return <TrueReward userId={user.userId} />;
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
