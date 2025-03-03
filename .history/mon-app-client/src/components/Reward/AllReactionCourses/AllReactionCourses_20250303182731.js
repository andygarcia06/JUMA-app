import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AllReactionCourses.css'; // Fichier de styles associé

const AllReactionCourses = ({ userId }) => {
  const [courseCount, setCourseCount] = useState(0); // État pour stocker le nombre de cours avec réactions

  // Paliers (badges) et leur seuil
  // À adapter selon tes besoins (ici un exemple)
  const badges = [
    { threshold: 10,  name: "Actif" },
    { threshold: 50,  name: "Engagé" },
    { threshold: 100, name: "Fervent" },
    { threshold: 500, name: "Prolifique" },
    { threshold: 1000, name: "Infatigable" }
  ];

  useEffect(() => {
    const fetchAllReactions = async () => {
      try {
        const response = await axios.get(`/user/${userId}/allReactions`);
        const userData = response.data;

        if (userData && userData.userReactions && Array.isArray(userData.userReactions)) {
          const reactionCount = userData.userReactions.length;
          setCourseCount(reactionCount);
          console.log("Nombre de cours avec réactions :", reactionCount);
        } else {
          console.log("L'utilisateur n'a pas de réactions.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des réactions de l'utilisateur :", error);
      }
    };

    fetchAllReactions();
  }, [userId]);

  // Trouver le badge le plus élevé déjà débloqué
  const highestBadge = badges.reduce((acc, badge) => {
    return courseCount >= badge.threshold ? badge : acc;
  }, { threshold: 0, name: '' });

  // Trouver le prochain badge à atteindre (si pas encore tout débloqué)
  const nextBadge = badges.find(b => b.threshold > courseCount);

  // Calcul de la progression (0–100) vers le prochain badge
  // Si on a déjà dépassé le dernier badge, on fixe la progression à 100
  const maxThreshold = nextBadge ? nextBadge.threshold : highestBadge.threshold;
  const progressPercentage = nextBadge
    ? Math.min((courseCount / maxThreshold) * 100, 100)
    : 100;

  return (
    <div className="all-reaction-courses">
      <h3>Cours avec réactions des utilisateurs</h3>
      <p>En réagissant sur vos cours</p>

      {/* Liste des badges */}
      <div className="badges-list">
        {badges.map((badge, index) => {
          const isUnlocked = courseCount >= badge.threshold;
          return (
            <div key={index} className="badge-item">
              <div className={`badge-icon ${isUnlocked ? 'unlocked' : 'locked'}`}>
                {/* Tu peux placer ici une icône ou une image si tu le souhaites */}
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
            {courseCount}/{nextBadge ? nextBadge.threshold : 'Max'}
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
        Vous avez <strong>{courseCount}</strong> cours avec réactions.
        {nextBadge && (
          <> Objectif pour le prochain palier (<em>{nextBadge.name}</em>) : <strong>{nextBadge.threshold}</strong></>
        )}
      </p>
    </div>
  );
};

export default AllReactionCourses;
