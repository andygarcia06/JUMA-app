import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ModuleValidateRewards.css';

const ModuleValidateRewards = ({ user, onBadgeUnlockedModuleValidate }) => {
  // Utilisation du pseudo de l'utilisateur comme identifiant
  const userIdentifier = user ? user.pseudo : null;

  const [validatedModulesCount, setValidatedModulesCount] = useState(0);
  const [currentValidatedLevel, setCurrentValidatedLevel] = useState('');

  // Définition des paliers (badges) et leur seuil
  const badges = [
    { threshold: 1,   name: 'enthousiaste' },
    { threshold: 10,  name: 'sage' },
    { threshold: 100, name: 'virtuose' },
    { threshold: 250, name: 'philosophe' },
    { threshold: 500, name: 'lumière' }
  ];

  // Récupération des modules validés pour l'utilisateur (utilisant le pseudo)
  useEffect(() => {
    const fetchValidatedModules = async () => {
      try {
        console.log(`[ModuleValidateRewards] Appel API pour ${userIdentifier}`);
        const response = await axios.get(`/api/user/${userIdentifier}/validatedModulesCount`);
        console.log('[ModuleValidateRewards] Réponse API:', response.data);
        setValidatedModulesCount(response.data.validatedModulesCount);
      } catch (error) {
        console.error("Erreur lors de la récupération des modules validés :", error);
      }
    };

    if (userIdentifier) {
      fetchValidatedModules();
    }
  }, [userIdentifier]);

  // Détermine le badge le plus élevé déjà débloqué
  const highestBadge = badges.reduce((acc, badge) => {
    return validatedModulesCount >= badge.threshold ? badge : acc;
  }, { threshold: 0, name: '' });

  // Détermine le prochain badge à atteindre
  const nextBadge = badges.find(b => b.threshold > validatedModulesCount);

  // Calcul de la progression vers le prochain palier (en pourcentage)
  const maxThreshold = nextBadge ? nextBadge.threshold : highestBadge.threshold;
  const progressPercentage = nextBadge
    ? Math.min((validatedModulesCount / maxThreshold) * 100, 100)
    : 100;

  // Appel de la callback vers le parent dès qu'un nouveau badge est débloqué
  useEffect(() => {
    if (highestBadge.name && highestBadge.name !== currentValidatedLevel) {
      console.log(`[ModuleValidateRewards] Badge débloqué: ${highestBadge.name}`);
      if (typeof onBadgeUnlockedModuleValidate === 'function') {
        onBadgeUnlockedModuleValidate(highestBadge.name);
      }
      setCurrentValidatedLevel(highestBadge.name);
    }
  }, [highestBadge.name, currentValidatedLevel, onBadgeUnlockedModuleValidate]);

  return (
    <div className="module-validate-rewards">
      <h2>Obtenez ici des trophées d'Apprenant</h2>
      <p>En validant des modules (progression à 100%)</p>

      {/* Affichage des badges */}
      <div className="badges-list">
        {badges.map((badge, index) => {
          const isUnlocked = validatedModulesCount >= badge.threshold;
          return (
            <div key={index} className="badge-item">
              <div className={`badge-icon ${isUnlocked ? 'unlocked' : 'locked'}`}>
                {/* Vous pouvez insérer ici une icône ou une image personnalisée */}
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
            {validatedModulesCount}/{nextBadge ? nextBadge.threshold : 'Max'}
          </div>
          <div
            className="circle-progress-fill"
            style={{ 
              background: `conic-gradient(#4caf50 ${progressPercentage * 3.6}deg, #eee 0deg)` 
            }}
          ></div>
        </div>
      </div>

      <p>
        Vous avez validé <strong>{validatedModulesCount}</strong> module(s)
        {nextBadge && (
          <>. Objectif pour le prochain palier (<em>{nextBadge.name}</em>) : <strong>{nextBadge.threshold}</strong></>
        )}
      </p>
    </div>
  );
};

export default ModuleValidateRewards;
