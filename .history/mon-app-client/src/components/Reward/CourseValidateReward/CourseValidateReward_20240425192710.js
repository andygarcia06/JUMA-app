import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style2.css'

const CoursValideReward = ({ userId }) => {
  const [courseCount, setCourseCount] = useState(0); // État pour stocker le nombre de cours validés

  useEffect(() => {
    const fetchValidatedCourses = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/user/${userId}`);
        const userData = response.data;

        // Vérifier si l'utilisateur a des cours validés
        if (userData && userData.courses && Array.isArray(userData.courses)) {
          const courseCount = userData.courses.length;

          // Mettre à jour l'état avec le nombre de cours validés
          setCourseCount(courseCount);

          // Afficher le nombre de cours validés dans la console
          console.log("Nombre de cours validés :", courseCount);
          
          // Afficher les cours validés dans la console
          console.log("Cours validés :", userData.courses);
        } else {
          console.log("L'utilisateur n'a pas de cours validés.");
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des cours validés par l\'utilisateur :', error);
      }
    };

    fetchValidatedCourses();
  }, [userId]);

  // Calculer la largeur de la barre de progression en fonction du nombre de cours validés
  const calculateProgressWidth = () => {
    return `${(courseCount / 250) * 100}%`; // Convertit le nombre de cours validés en pourcentage pour une barre de progression basée sur 250
  };

  return (
    <div>
      <h2>Cours validés par l'utilisateur</h2>
      <p>En consultant des modules et des cours</p>
      <div className="progress-bar">
        <div className="progress-level-2 active" style={{ width: calculateProgressWidth() }}>
          {courseCount}/250
        </div>
      </div>
    </div>
  );
};

export default CoursValideReward;
