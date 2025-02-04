import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';

const CreateModuleReward = ({ userId }) => {
  const [progressCount, setProgressCount] = useState(0);

  useEffect(() => {
    const fetchModuleAndTicketCount = async () => {
      try {
        // Appeler la nouvelle route serveur pour récupérer le nombre total d'entrées
        const response = await axios.get(`http://localhost:3001/api/user/${userId}/module-and-ticket-count`);
        const { totalEntries } = response.data; // Récupérer le total des entrées (modules + tickets)
        setProgressCount(totalEntries); // Mettre à jour l'état
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };

    fetchModuleAndTicketCount();
  }, [userId]);

  const calculateProgressWidth = () => {
    const maxEntries = 250; // Objectif total de 250 entrées
    return `${Math.min((progressCount / maxEntries) * 100, 100)}%`; // Calcul de la progression et limiter à 100%
  };

  const renderBadges = () => {
    const badges = [1, 5, 25, 40];
    return badges.map((badge, index) => (
      <div key={index} className="badge">
        {progressCount >= badge && <span>{getBadgeName(badge)}</span>}
        {progressCount >= badge && <span className="badge-validated">✅</span>}
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
      <h3>Champion de la création</h3>
      <p>En créant de nouveaux modules et tickets</p>

      <div className="progress-bar">
        <div className="progress-level active" style={{ width: calculateProgressWidth() }}>
          {progressCount}/{250} {/* Affiche la progression et le total de 250 */}
        </div>
      </div>
      <div className="badges-container">
        {renderBadges()}
      </div>
    </div>
  );
};

export default CreateModuleReward;
