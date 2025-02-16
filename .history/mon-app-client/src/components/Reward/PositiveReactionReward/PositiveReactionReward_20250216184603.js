import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PositiveReactionReward = ({ userId }) => {
  const [userReactions, setUserReactions] = useState([]);
  const [reactionCount, setReactionCount] = useState(0); // État pour stocker le nombre de réactions

  useEffect(() => {
    const fetchUserReactions = async () => {
      try {
        const response = await axios.get(`/user/${userId}/positiveReactions`);
        setUserReactions(response.data.userPositiveReactions);

        // Mettre à jour le nombre de réactions
        const count = response.data.userPositiveReactions.length;
        setReactionCount(count);

        // Afficher le nombre de réactions dans la console
        console.log("Nombre de réactions positives :", count);

        // Afficher les données reçues du backend dans la console
        console.log("Données reçues du backend :", response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des réactions de l\'utilisateur :', error);
      }
    };

    fetchUserReactions();
  }, [userId]);

  const calculateProgressWidth = () => {
    return `${(reactionCount / 1000) * 100}%`; // Convertit le nombre de réactions positives en pourcentage pour une barre de progression basée sur 1000
  };

  const calculateBadge = () => {
    if (reactionCount >= 1000) {
      return "Illustre";
    } else if (reactionCount >= 800) {
      return "Acclamé(e)";
    } else if (reactionCount >= 250) {
      return "Renommé(e)";
    } else if (reactionCount >= 50) {
      return "Reconnu(e)";
    } else {
      return "";
    }
  };

  const renderBadges = () => {
    const badge = calculateBadge();
    if (badge !== "") {
      return (
        <div className="badge">
          <span>{badge}</span>
          <span className="badge-validated">✅</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h3>Champion des réactions positives</h3>
      <p>En recevant des réactions positives dans vos propres modules</p>
      <p>Nombre de réactions positives : {reactionCount}</p>
      <div className="progress-bar">
        <div className="progress-level active" style={{ width: calculateProgressWidth() }}>
          {reactionCount}/1000
        </div>
      </div>
      <div className="badges-container">
        {renderBadges()}
      </div>
    </div>
  );
};

export default PositiveReactionReward;
