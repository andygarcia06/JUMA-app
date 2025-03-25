import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';

const CreateModuleReward = ({ user, onBadgeUnlockedCreateModule }) => {
  // Utiliser le pseudo de l'utilisateur comme identifiant
  const userIdentifier = user ? user.pseudo : null;

  const [progressCount, setProgressCount] = useState(0);
  const [currentCreationLevel, setCurrentCreationLevel] = useState('');

  // Liste des badges avec leur seuil et leur nom
  const badges = [
    { threshold: 1,  name: "Champion" },
    { threshold: 5,  name: "Guide" },
    { threshold: 25, name: "Modèle" },
    { threshold: 40, name: "Guru" }
  ];

  useEffect(() => {
    const fetchModuleAndTicketCount = async () => {
      try {
        if (!userIdentifier) {
          console.warn("[CreateModuleReward] Aucun identifiant utilisateur (pseudo) fourni.");
          return;
        }
        console.log(`[CreateModuleReward] Appel API pour l'utilisateur: ${userIdentifier}`);
        const response = await axios.get(`/api/user/${userIdentifier}/module-and-ticket-count`);
        console.log("[CreateModuleReward] Réponse API:", response.data);
        const { totalEntries } = response.data;
        setProgressCount(totalEntries);
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };

    fetchModuleAndTicketCount();
  }, [userIdentifier]);

  // Déterminer le badge le plus élevé déjà débloqué
  const highestBadge = badges.reduce((acc, badge) => {
    return progressCount >= badge.threshold ? badge : acc;
  }, { threshold: 0, name: '' });

  // Déterminer le prochain badge à atteindre
  const nextBadge = badges.find(b => b.threshold > progressCount);

  // Calculer la progression (en pourcentage) vers le prochain badge
  const maxThreshold = nextBadge ? nextBadge.threshold : highestBadge.threshold;
  const progressPercentage = nextBadge
    ? Math.min((progressCount / maxThreshold) * 100, 100)
    : 100;

  // Appel de la callback vers le parent dès qu'un nouveau badge est débloqué
  useEffect(() => {
    if (highestBadge.name && highestBadge.name !== currentCreationLevel) {
      console.log(`[CreateModuleReward] Nouveau badge débloqué: ${highestBadge.name}`);
      if (typeof onBadgeUnlockedCreateModule === 'function') {
        onBadgeUnlockedCreateModule(highestBadge.name);
      }
      setCurrentCreationLevel(highestBadge.name);
    }
  }, [highestBadge.name, currentCreationLevel, onBadgeUnlockedCreateModule]);

  return (
    <div className="create-module-reward">
      <h3>Champion de la création</h3>
      <p>En créant de nouveaux modules et tickets</p>

      {/* Affichage des badges */}
      <div className="badges-list">
        {badges.map((badge, index) => {
          const isUnlocked = progressCount >= badge.threshold;
          return (
            <div key={index} className="badge-item">
              <div className={`badge-icon ${isUnlocked ? 'unlocked' : 'locked'}`}>
                {/* Vous pouvez insérer ici une icône ou image personnalisée */}
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
