import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';

const CreateModuleReward = ({ userId }) => {
  const [modulesCreated, setModulesCreated] = useState(0);

  useEffect(() => {
    const fetchModulesCreatedByUser = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/modules/creator/${userId}`);
        const modulesData = response.data;
        const totalModules = modulesData.length;
        setModulesCreated(totalModules);
      } catch (error) {
        console.error('Erreur lors de la récupération des données des modules créés par l\'utilisateur :', error);
      }
    };

    fetchModulesCreatedByUser();
  }, [userId]);

  const calculateProgressWidth = () => {
    return `${(modulesCreated / 100) * 100}%`; // Convertit le nombre de modules créés en pourcentage pour une barre de progression basée sur 100
  };

  const renderBadges = () => {
    const badges = [1, 5, 25, 40];
    return badges.map((badge, index) => (
      <div key={index} className="badge">
        {modulesCreated >= badge && <span>{getBadgeName(badge)}</span>}
        {modulesCreated >= badge && <span className="badge-validated">✅</span>}
      </div>
    ));
  };

  const getBadgeName = (badge) => {
    switch (badge) {
      case 1:
        return "Champion";
      case 5:
        return "Guide";
      case 25:
        return "Modèle";
      case 40:
        return "Guru";
      default:
        return "";
    }
  };

  return (
    <div>
      <h3>Champion de la création de modules</h3>
      <p>En créant denouveaux modules</p>

      <div className="progress-bar">
        <div className="progress-level active" style={{ width: calculateProgressWidth() }}>
          {modulesCreated}/100
        </div>
      </div>
      <div className="badges-container">
        {renderBadges()}
      </div>
    </div>
  );
};

export default CreateModuleReward;
