import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PositiveReactionReward.css'; // Fichier de styles associé

const PositiveReactionReward = ({ userId, onBadgeUnlocked }) => {
  const [reactionCount, setReactionCount] = useState(0);

  // État local pour mémoriser le dernier badge transmis au parent
  const [currentPositiveLevel, setCurrentPositiveLevel] = useState('');

  // Définition des paliers (badges) : threshold = palier, name = nom du badge
  const badges = [
    { threshold: 50,   name: "Reconnu(e)" },
    { threshold: 250,  name: "Renommé(e)" },
    { threshold: 800,  name: "Acclamé(e)" },
    { threshold: 1000, name: "Illustre" }
  ];

  // Récupération du nombre total de réactions positives
  useEffect(() => {
    const fetchUserReactions = async () => {
      try {
        const response = await axios.get(`/user/${userId}/positiveReactions`);
        const count = response.data.userPositiveReactions.length;
        setReactionCount(count);
      } catch (error) {
        console.error('Erreur lors de la récupération des réactions positives :', error);
      }
    };

    fetchUserReactions();
  }, [userId]);

  // Trouver le badge le plus élevé déjà débloqué
  const highestBadge = badges.reduce((acc, badge) => {
    return (reactionCount >= badge.threshold) ? badge : acc;
  }, { threshold: 0, name: '' });

  // Trouver le prochain badge à atteindre
  const nextBadge = badges.find(b => b.threshold > reactionCount);

  // Calcul de la progression (0–100) vers le prochain badge
  const maxThreshold = nextBadge ? nextBadge.threshold : highestBadge.threshold;
  const progressPercentage = nextBadge
    ? Math.min((reactionCount / maxThreshold) * 100, 100)
    : 100;

  // ------------------------------------------------------------------
  //   APPEL DE CALLBACK VERS LE PARENT AU DÉBLOCAGE DU BADGE
  // ------------------------------------------------------------------
  useEffect(() => {
    // Si highestBadge.name n'est pas vide ET différent du dernier badge stocké
    if (highestBadge.name && highestBadge.name !== currentPositiveLevel) {
      // Appeler la callback si elle existe
      if (typeof onBadgeUnlocked === 'function') {
        onBadgeUnlocked(highestBadge.name);
      }
      // Mémoriser ce badge pour éviter de rappeler la callback en boucle
      setCurrentPositiveLevel(highestBadge.name);
    }
  }, [highestBadge.name, currentPositiveLevel, onBadgeUnlocked]);

  return (
    <div className="positive-reaction-reward">
      <h3>Champion des réactions positives</h3>
      <p>En recevant des réactions positives dans vos propres modules</p>

      {/* Liste des badges */}
      <div className="badges-list">
        {badges.map((badge, index) => {
          const isUnlocked = reactionCount >= badge.threshold;
          return (
            <div key={index} className="badge-item">
              <div className={`badge-icon ${isUnlocked ? 'unlocked' : 'locked'}`}>
                {/* Icône ou image personnalisée */}
              </div>
              <p>{badge.name}</p>
              {isUnlocked && <span className="badge-check">✅</span>}
            </div>
          );
        })}
      </div>

      {/* Cercle de progression vers le prochain badge */}
      <div className="circle-progress-container">
        <div className="circle-progress">
          <div className="circle-progress-value">
            {reactionCount}/{nextBadge ? nextBadge.threshold : 'Max'}
          </div>
          <div
            className="circle-progress-fill"
            style={{
              background: `conic-gradient(#4caf50 ${progressPercentage * 3.6}deg, #eee 0deg)`
            }}
          />
        </div>
      </div>

      <p>
        Vous avez reçu <strong>{reactionCount}</strong> réaction(s) positive(s).
        {nextBadge && (
          <> Objectif pour le prochain palier (<em>{nextBadge.name}</em>) : <strong>{nextBadge.threshold}</strong></>
        )}
      </p>
    </div>
  );
};

export default PositiveReactionReward;
