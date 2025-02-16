import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style2.css'; // Assurez-vous d'ajouter votre fichier CSS

const CreateModuleReward = ({ userId }) => {
  const [progressCount, setProgressCount] = useState(0);

  useEffect(() => {
    const fetchModuleAndTicketCount = async () => {
      try {
        // Appeler la nouvelle route serveur
        const response = await axios.get(`/api/user/${userId}/module-and-ticket-count`);
        const { totalEntries } = response.data; // Récupérer le total des entrées (modules + tickets)
        setProgressCount(totalEntries); // Mettre à jour l'état
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };

    fetchModuleAndTicketCount();
  }, [userId]);

  // Calcul de la largeur de la barre de progression (sur 100)
  const calculateProgressWidth = () => {
    return `${(progressCount / 100) * 100}%`; // La barre de progression (max 100%)
  };

  // Fonction pour obtenir le nom du badge
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

  // Rendu des badges lorsque la progression atteint certains niveaux
  const renderBadges = () => {
    const badges = [1, 5, 25, 40];
    return badges.map((badge, index) => (
      <div key={index} className="badge">
        {/* Si la progression atteint le seuil du badge, on l'affiche */}
        {progressCount >= badge && (
          <>
            <span className="badge-name">{getBadgeName(badge)}</span>
            <span className="badge-validated">✅</span>
          </>
        )}
      </div>
    ));
  };

  return (
    <div>
      <h3>Champion de la création</h3>
      <p>En créant de nouveaux modules et tickets</p>

      <div className="progress-bar">
        <div className="progress-level-2" style={{ width: calculateProgressWidth() }}>
          {progressCount}/100 {/* Affichage de la progression actuelle */}
        </div>
      </div>

      <div className="badges-container">
        {renderBadges()} {/* Affichage des badges si les conditions sont remplies */}
      </div>
    </div>
  );
};

export default CreateModuleReward;
