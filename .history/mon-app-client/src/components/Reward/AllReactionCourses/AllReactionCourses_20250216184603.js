import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AllReactionCourses = ({ userId }) => {
  const [courseCount, setCourseCount] = useState(0); // État pour stocker le nombre de cours avec réactions

  useEffect(() => {
    const fetchAllReactions = async () => {
      try {
        const response = await axios.get(`/user/${userId}/allReactions`);
        const userData = response.data;
      
        // Vérifier si les données contiennent des réactions et si elles sont définies
        if (userData && userData.userReactions && Array.isArray(userData.userReactions)) {
          const reactionCount = userData.userReactions.length;
      
          // Mettre à jour l'état avec le nombre de réactions
          setCourseCount(reactionCount);
      
          // Afficher le nombre de réactions dans la console
          console.log("Nombre de cours avec réactions :", reactionCount);
        } else {
          console.log("L'utilisateur n'a pas de réactions.");
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des réactions de l\'utilisateur :', error);
      }
    };

    fetchAllReactions();
  }, [userId]);

  const calculateProgressWidth = () => {
    return `${(courseCount / 1000) * 100}%`; // Convertit le nombre de cours avec réactions en pourcentage pour une barre de progression basée sur 100
  };

  return (
    <div>
      <h3>Cours avec réactions des utilisateur</h3>
      <p>En réagissant</p>
      <p>Nombre de cours avec réactions : {courseCount}</p>
      <div className="progress-bar">
        <div className="progress-level-2 active" style={{ width: calculateProgressWidth() }}>
          {courseCount}/1000
        </div>
      </div>
    </div>
  );
};

export default AllReactionCourses;
