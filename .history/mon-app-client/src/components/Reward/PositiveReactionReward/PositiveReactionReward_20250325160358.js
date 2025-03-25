import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PositiveReactionReward.css'; // Fichier de styles associé

const PositiveReactionReward = ({ user, onBadgeUnlockedPositiveReaction }) => {
  // Utiliser le pseudo de l'utilisateur comme identifiant
  const userIdentifier = user ? user.pseudo : null;
  
  const [reactionCount, setReactionCount] = useState(0);
  const [currentPositiveLevel, setCurrentPositiveLevel] = useState('');

  // Définition des paliers (badges)
  const badges = [
    { threshold: 50,   name: "Reconnu(e)" },
    { threshold: 250,  name: "Renommé(e)" },
    { threshold: 800,  name: "Acclamé(e)" },
    { threshold: 1000, name: "Illustre" }
  ];

  // Récupérer le nombre total de réactions positives pour cet utilisateur
  useEffect(() => {
    const fetchUserReactions = async () => {
      try {
        // L'API est appelée avec l'identifiant utilisateur (pseudo)
        const response = await axios.get(`/user/${userIdentifier}/positiveReactions`);
        const count = response.data.userPositiveReactions.length;
        setReactionCount(count);
      } catch (error) {
        console.error('Erreur lors de la récupération des réactions positives :', error);
      }
    };

    if (userIdentifier) {
      fetchUserReactions();
    }
  }, [userIdentifier]);

  // Détermine le badge le plus élevé déjà débloqué
  const highestBadge = badges.reduce((acc, badge) => {
    return reactionCount >= badge.threshold ? badge : acc;
  }, { threshold: 0, name: '' });

  // Détermine le prochain badge à atteindre
  const nextBadge = badges.find(b => b.threshold > reactionCount);

  // Calcul de la progression (0–100%) vers le prochain badge
  const maxThreshold = nextBadge ? nextBadge.threshold : highestBadge.threshold;
  const progressPercentage = nextBadge
    ? Math.min((reactionCount / maxThreshold) * 100, 100)
    : 100;

  // Appel de callback vers le parent dès qu'un nouveau badge est débloqué
  useEffect(() => {
    if (highestBadge.name && highestBadge.name !== currentPositiveLevel) {
      if (typeof onBadgeUnlockedPositiveReaction === 'function') {
        onBadgeUnlockedPositiveReaction(highestBadge.name);
      }
      setCurrentPositiveLevel(highestBadge.name);
    }
  }, [highestBadge.name, currentPositiveLevel, onBadgeUnlockedPositiveReaction]);

  return (
    <div className="positive-reaction-reward">
      <h3>Champion des réactions positives</h3>
      <p>En recevant des réactions positives sur vos modules</p>

      {/* Liste des badges */}
      <div className="badges-list">
        {badges.map((badge, index) => {
          const isUnlocked = reactionCount >= badge.threshold;
          return (
            <div key={index} className="badge-item">
              <div className={`badge-icon ${isUnlocked ? 'unlocked' : 'locked'}`}>
                {/* Vous pouvez insérer ici une icône ou une image */}
              </div>
              <p>{badge.name}</p>
              {isUnlocked && <span className="badge-check">✅</span>}
            </div>
          );
        })}
      </div>

      {/* Cercle de progression */}
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
