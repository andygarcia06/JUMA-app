// Reward.js

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LeftMenu from './LeftMenu/LeftMenu';
import CreateModuleReward from './CreateModuleReward/CreateModuleReward';
import PositiveReactionReward from './PositiveReactionReward/PositiveReactionReward';
import AllReactionCourses from './AllReactionCourses/AllReactionCourses';
import CoursValideReward from './CourseValidateReward/CourseValidateReward';
import ModuleValidateRewards from './ModuleValidatedRewards/ModuleValidatedRewards';
import TrueReward from './TrueReward/TrueReward';
import './Reward.css';

const Reward = ({ onBadgesUpdate }) => {
  const location = useLocation();
  const user = location.state && location.state.user;
  const [activeComponent, setActiveComponent] = useState('Rewards');

  // -- États pour stocker les badges débloqués --
  const [creationLevel, setCreationLevel] = useState('');
  const [positiveReactionsLevel, setPositiveReactionsLevel] = useState('');
  const [allReactionsLevel, setAllReactionsLevel] = useState('');
  const [modulesValidatedLevel, setModulesValidatedLevel] = useState('');

  if (!user) {
    return <div>Données utilisateur non disponibles</div>;
  }

  // Callbacks de badges (déjà créées)
  const handleBadgeUnlockedCreateModule = (newBadge) => {
    setCreationLevel(newBadge);
  };
  const handleBadgeUnlockedPositiveReaction = (newBadge) => {
    setPositiveReactionsLevel(newBadge);
  };
  const handleBadgeUnlockedAllReaction = (newBadge) => {
    setAllReactionsLevel(newBadge);
  };
  const handleBadgeUnlockedModuleValidate = (newBadge) => {
    setModulesValidatedLevel(newBadge);
  };

  // -- Surveiller les 4 badges et notifier le parent --
  useEffect(() => {
    if (typeof onBadgesUpdate === 'function') {
      onBadgesUpdate({
        creationLevel,
        positiveReactionsLevel,
        allReactionsLevel,
        modulesValidatedLevel
      });
    }
  }, [
    creationLevel,
    positiveReactionsLevel,
    allReactionsLevel,
    modulesValidatedLevel,
    onBadgesUpdate
  ]);

  const handleMenuChange = (menu) => {
    setActiveComponent(menu);
  };

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
          </div>
        );
      case 'TrueReward':
        return <TrueReward userId={user.userId} />;
      default:
        return null;
    }
  };

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
