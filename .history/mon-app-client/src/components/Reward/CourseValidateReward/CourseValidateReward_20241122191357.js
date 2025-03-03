import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style2.css'; // Assurez-vous d'ajouter votre fichier CSS

const CoursValideReward = ({ userId }) => {
  const [courseCount, setCourseCount] = useState(0); // Nombre total de cours
  const [validatedCount, setValidatedCount] = useState(0); // Nombre de modules validés
  const [progressPercentage, setProgressPercentage] = useState(0); // Pourcentage de progression

  // Fonction pour récupérer la progression de l'utilisateur
  const fetchProgress = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}/progression`);
      setCourseCount(response.data.totalCourses); // Nombre total de cours
      setValidatedCount(response.data.validatedCount); // Nombre de modules validés

      // Calculer la progression en fonction du total des éléments
      const totalElements = response.data.totalCourses + response.data.validatedCount;
      const maxElements = 100; // Total maximum attendu, à adapter selon votre logique

      // Calcul de la progression en pourcentage (ex: 6 éléments validés sur 100)
      const progress = (totalElements / maxElements) * 100;
      setProgressPercentage(progress); // Mise à jour de la progression
    } catch (error) {
      console.error('Erreur lors de la récupération de la progression :', error);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  return (
    <div>
      <h2>Cours validés par l'utilisateur</h2>
      <p>En consultant des modules et des cours</p>
      <div className="progress-bar">
        {/* La largeur est fixée à 100%, mais la progression bleue est calculée */}
        <div className="progress-level-2 active" style={{ width: `${progressPercentage}%` }}>
          {validatedCount + courseCount}/{100} {/* Affiche le total des éléments */}
        </div>
      </div>
    </div>
  );
};

export default CoursValideReward;
