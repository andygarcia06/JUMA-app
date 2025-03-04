import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style2.css'; // Assurez-vous d'ajouter votre fichier CSS

const CreateModuleReward = ({ userId, onBadgeUnlocked }) => {
  const [progressCount, setProgressCount] = useState(0);
  const [currentCreationLevel, setCurrentCreationLevel] = useState('');

  // Liste des badges avec leur seuil (threshold) et leur nom
  const badges = [
    { threshold: 1,  name: "Champion" },
    { threshold: 5,  name: "Guide" },
    { threshold: 25, name: "Modèle" },
    { threshold: 40, name: "Guru" }
  ];

  useEffect(() => {
    const fetchModuleAndTicketCount = async () => {
      try {
        // Appel à la route serveur pour récupérer le nombre total d’entrées (modules + tickets)
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
    return progressCount >= badge.threshold ? badge : acc;
  }, { threshold: 0, name: '' });

  // Trouver le prochain badge à atteindre (si on n’a pas encore tout débloqué)
  const nextBadge = badges.find(b => b.threshold > progressCount);

  // Calcul de la progression (0–100) vers le prochain badge
  const maxThreshold = nextBadge ? nextBadge.threshold : highestBadge.threshold;
  const progressPercentage = nextBadge
    ? Math.min((progressCount / maxThreshold) * 100, 100)
    : 100;

  // ------------------------------------------------------------
  //   APPEL DE CALLBACK VERS LE PARENT (lifting state up)
  // ------------------------------------------------------------
  useEffect(() => {
    // Si highestBadge.name n'est pas vide ET différent du dernier badge mémorisé
    if (highestBadge.name && highestBadge.name !== currentCreationLevel) {
      // Si le parent nous a fourni une callback, on l’appelle
      if (typeof onBadgeUnlocked === 'function') {
        onBadgeUnlocked(highestBadge.name);
      }
      // Mémoriser ce nouveau niveau pour éviter de rappeler la callback en boucle
      setCurrentCreationLevel(highestBadge.name);
    }
  }, [highestBadge.name, currentCreationLevel, onBadgeUnlocked]);

  return (
    <div className="create-module-reward">
      <h3>Champion de la création</h3>
      <p>En créant de nouveaux modules et tickets</p>

      {/* Liste des badges */}
      <div className="badges-list">
        {badges.map((badge, index) => {
          const isUnlocked = progressCount >= badge.threshold;
          return (
            <div key={index} className="badge-item">
              <div className={`badge-icon ${isUnlocked ? 'unlocked' : 'locked'}`}>
                {/* Icône ou visuel pour le badge */}
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
