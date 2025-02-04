import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style2.css'

const CoursValideReward = ({ userId }) => {
  const [courseCount, setCourseCount] = useState(0); // État pour stocker le nombre de cours validés

  // Fonction pour mettre à jour le nombre de cours validés
  const updateValidatedCourses = async (moduleId) => {
    try {
      const response = await axios.post(`http://localhost:3001/api/users/${userId}/validateCourse`, { moduleId });
      const validatedCourses = response.data.validatedCourses;
      setCourseCount(validatedCourses.length); // Met à jour l'état avec le nouveau nombre de cours validés
    } catch (error) {
      console.error('Erreur lors de la validation du cours :', error);
    }
  };

  useEffect(() => {
    const fetchValidatedCourses = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/user/${userId}`);
        const userData = response.data;

        if (userData && userData.courses && Array.isArray(userData.courses)) {
          const courseCount = userData.courses.length;
          setCourseCount(courseCount);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des cours validés par l\'utilisateur :', error);
      }
    };

    fetchValidatedCourses();
  }, [userId]);

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
