import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';

const CreateModuleReward = ({ userId }) => {
  const [progressCount, setProgressCount] = useState(0);

  // Définition des paliers (badges) : threshold = palier, name = nom du badge
  const badges = [
    { threshold: 1,  name: "Champion" },
    { threshold: 5,  name: "Guide" },
    { threshold: 25, name: "Modèle" },
    { threshold: 40, name: "Guru" }
  ];

  useEffect(() => {
    const fetchModuleAndTicketCount = async () => {
      try {
        // Appel à la route serveur pour récupérer le nombre total d’entrées
        const response = await axios.get(`/api/user/${userId}/module-and-ticket-count`);
        const { totalEntries } = response.data;
        setProgressCount(totalEntries);
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };

    fetchModuleAndTicketCount();
  }, [userId]);

  // Trouver le badge le plus élevé déjà débloqué
  const highestBadge = badges.reduce((acc, badge) => {
    return (progressCount >= badge.threshold) ? badge : acc;
  }, { threshold: 0, name: '' });

  // Trouver le prochain badge à atteindre (si on n’a pas encore tout débloqué)
  const nextBadge = badges.find(b => b.threshold > progressCount);

  // Calcul de la progression (0–100) vers le prochain badge
  // Si on a déjà dépassé le dernier badge, on fixe la progression à 100
  const maxThreshold = nextBadge ? nextBadge.threshold : highestBadge.threshold;
  const progressPercentage = nextBadge
    ? Math.min((progressCount / maxThreshold) * 100, 100)
    : 100;

  return (
    <div className="create-module-reward">
      <h3>Champion de la création</h3>
      <p>En créant de nouveaux modules et tickets</p>

      {/* Affichage des badges avec état verrouillé/débloqué */}
      <div className="badges-list">
        {badges.map((badge, index) => {
          const isUnlocked = progressCount >= badge.threshold;
          return (
            <div key={index} className="badge-item">
              <div className={`badge-icon ${isUnlocked ? 'unlocked' : 'locked'}`}>
                {/* Place ici une icône ou une image si souhaité */}
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
            {progressCount}/{nextBadge ? nextBadge.threshold : 'Max'}
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
        Vous avez créé <strong>{progressCount}</strong> module(s)/ticket(s).
        {nextBadge && (
          <> Objectif pour le prochain palier (<em>{nextBadge.name}</em>) : <strong>{nextBadge.threshold}</strong></>
        )}
      </p>
    </div>
  );
};

export default CreateModuleReward;
