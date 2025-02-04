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
      const response = await axios.get(`http://localhost:3001/api/users/${userId}/progression`);
      setCourseCount(response.data.totalCourses); // Nombre total de cours
      setValidatedCount(response.data.validatedCount); // Nombre de modules validés
      setProgressPercentage(response.data.progress); // Pourcentage de progression
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
        <div className="progress-level-2 active" style={{ width: `${progressPercentage}%` }}>
          {validatedCount + courseCount}/{100} {/* Ici, 6 est le total des entrées attendues */}
        </div>
      </div>
    </div>
  );
};

export default CoursValideReward;
