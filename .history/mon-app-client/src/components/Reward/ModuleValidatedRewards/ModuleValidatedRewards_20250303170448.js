import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ModuleValidateRewards.css'; // Fichier CSS optionnel

const ModuleValidateRewards = ({ userId }) => {
  // État local pour stocker le nombre de modules validés
  const [validatedModulesCount, setValidatedModulesCount] = useState(0);

  // Paliers (badges) et leur seuil
  const badges = [
    { threshold: 1,   name: 'enthousiaste' },
    { threshold: 10,  name: 'sage' },
    { threshold: 100, name: 'virtuose' },
    { threshold: 250, name: 'philosophe' },
    { threshold: 500, name: 'lumière' }
  ];

  // Récupérer les données depuis la route
  useEffect(() => {
    const fetchValidatedModules = async () => {
      try {
        const response = await axios.get(`/api/user/${userId}/validatedModulesCount`);
        setValidatedModulesCount(response.data.validatedModulesCount);
      } catch (error) {
        console.error("Erreur lors de la récupération des modules validés :", error);
      }
    };

    fetchValidatedModules();
  }, [userId]);

  // Trouver le badge le plus élevé déjà atteint
  const highestBadge = badges.reduce((acc, badge) => {
    return (validatedModulesCount >= badge.threshold) ? badge : acc;
  }, { threshold: 0, name: '' });

  // Trouver le prochain palier
  const nextBadge = badges.find(b => b.threshold > validatedModulesCount);

  // Calcul de la progression vers le prochain palier
  // Si on a dépassé le dernier palier, la progression est considérée à 100%
  const maxThreshold = nextBadge ? nextBadge.threshold : highestBadge.threshold;
  const progressPercentage = nextBadge
    ? Math.min((validatedModulesCount / maxThreshold) * 100, 100)
    : 100;

  return (
    <div className="module-validate-rewards">
      <h2>Obtenez ici des trophées d'Apprenant</h2>
      <p>En validant des modules (progression à 100%)</p>

      <div className="badges-list">
        {badges.map((badge, index) => {
          const isUnlocked = validatedModulesCount >= badge.threshold;
          return (
            <div key={index} className="badge-item">
              {/* On peut mettre une icône ou un visuel différent selon l'état (verrouillé/débloqué) */}
              <div className={`badge-icon ${isUnlocked ? 'unlocked' : 'locked'}`}>
                {/* Icône ou image du badge */}
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
          {/* Ici tu peux utiliser un composant de cercle de progression 
              ou le dessiner en CSS. Pour l'exemple, on affiche juste un texte : */}
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
        {nextBadge && <>. Objectif pour le prochain palier ({nextBadge.name}) : <strong>{nextBadge.threshold}</strong></>}
      </p>
    </div>
  );
};

export default ModuleValidateRewards;
