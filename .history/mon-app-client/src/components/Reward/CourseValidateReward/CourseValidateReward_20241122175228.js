import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style2.css';

const CoursValideReward = ({ userId }) => {
  const [courseCount, setCourseCount] = useState(0); // Nombre total de cours
  const [validatedCount, setValidatedCount] = useState(0); // Nombre de cours validés
  const [progressPercentage, setProgressPercentage] = useState(0); // Pourcentage de progression

  // Fonction pour récupérer la progression de l'utilisateur
  const fetchProgress = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}/progression`);
      setCourseCount(response.data.totalCourses);
      setValidatedCount(response.data.validatedCount);
      setProgressPercentage(response.data.progress);
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
          {validatedCount}/{courseCount}
        </div>
      </div>
    </div>
  );
};

export default CoursValideReward;
