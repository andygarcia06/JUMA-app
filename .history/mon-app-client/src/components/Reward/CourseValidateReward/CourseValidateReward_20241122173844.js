import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style2.css'

const CoursValideReward = ({ userId }) => {
  const [courseCount, setCourseCount] = useState(0); // État pour stocker le nombre de cours validés

  useEffect(() => {
    const fetchValidatedCourses = async () => {
      try {
        const response = await axios.get(`/user/${userId}`);
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

  const handleValidateCourse = async (moduleId) => {
    try {
      const response = await axios.post(`http://localhost:3001/api/users/${userId}/validateCourse`, { moduleId });
      console.log('Cours validé :', response.data);
  
      // Mettre à jour le nombre de cours validés
      setCourseCount(response.data.validatedCourses.length);
    } catch (error) {
      console.error('Erreur lors de la validation du cours :', error);
    }
  };
  

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
  
      <button onClick={() => handleValidateCourse('module_123456789')}>Valider un cours</button>
    </div>
  );
  
};

export default CoursValideReward;
