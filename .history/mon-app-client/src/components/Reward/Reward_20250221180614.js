// Reward.js

import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import LeftMenu from './LeftMenu/LeftMenu';
import CreateModuleReward from './CreateModuleReward/CreateModuleReward';
import PositiveReactionReward from './PositiveReactionReward/PositiveReactionReward';
import AllReactionCourses from './AllReactionCourses/AllReactionCourses';
import CoursValideReward from './CourseValidateReward/CourseValidateReward';
import TrueReward from './TrueReward/TrueReward'; // Importez le composant TrueReward
import './Reward.css';

const Reward = () => {
  const location = useLocation();
  const user = location.state && location.state.user;

  const [activeComponent, setActiveComponent] = useState('Rewards'); // État pour suivre le composant actif

  if (!user) {
    // Gérer le cas où les données utilisateur ne sont pas disponibles
    return <div>Données utilisateur non disponibles</div>;
  }

  console.log("Données de l'utilisateur dans Rewards :", user);

  // Fonction pour changer le composant actif
  const handleMenuChange = (menu) => {
    setActiveComponent(menu);
  };

  // Fonction pour rendre le composant actif
  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'Rewards':
        return (
          <div className="rewards-container">
            <h2>Obtenez ici des trophées de Champions</h2>
            <CreateModuleReward userId={user.userId} />
            <PositiveReactionReward userId={user.userId} />
            <h2>Obtenez ici des trophées de d'Apprenant</h2>
            <CoursValideReward userId={user.userId} />
            <AllReactionCourses userId={user.userId} />
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
      <LeftMenu onActivateRewards={() => handleMenuChange('Rewards')} onActivateReduction={() => handleMenuChange('TrueReward')} />
      {renderActiveComponent()}
    </div>
  );
};

export default Reward;
