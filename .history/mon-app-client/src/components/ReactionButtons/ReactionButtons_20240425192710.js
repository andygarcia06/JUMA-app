import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaThumbsUp, FaThumbsDown, FaSmile, FaAngry, FaQuestion } from 'react-icons/fa';

const ReactionButtons = ({ userId, moduleId, courseId }) => {
  const [reactions, setReactions] = useState({
    thumbsUp: 0,
    thumbsDown: 0,
    smile: 0,
    angry: 0,
    question: 0
  });
  const [userReactions, setUserReactions] = useState({
    thumbsUp: false,
    thumbsDown: false,
    smile: false,
    angry: false,
    question: false
  });

  useEffect(() => {
    const fetchUserReactions = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/modules/${moduleId}/courses/${courseId}/reactions`);
        if (response.status === 200) {
          const { data } = response;
          setUserReactions(data);
          updateReactionsCount(data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des réactions de l\'utilisateur :', error);
      }
    };

    fetchUserReactions();
  }, [moduleId, courseId]);

  const updateReactionsCount = (reactionsData) => {
    const newReactions = {
      thumbsUp: countReactions(reactionsData, 'thumbsUp'),
      thumbsDown: countReactions(reactionsData, 'thumbsDown'),
      smile: countReactions(reactionsData, 'smile'),
      angry: countReactions(reactionsData, 'angry'),
      question: countReactions(reactionsData, 'question')
    };
    setReactions(newReactions);
  };

  const countReactions = (reactionsData, reactionType) => {
    if (!Array.isArray(reactionsData)) {
      // Si reactionsData n'est pas un tableau, retourner 0
      return 0;
    }
    return reactionsData.filter(reaction => reaction.reactionType === reactionType).length;
  };
  
  const handleReaction = async (reactionType) => {
    try {
      console.log("Réaction envoyée :", reactionType);
      console.log("Module concerné :", moduleId);
      console.log("Utilisateur concerné :", userId);
      console.log("Cours concerné :", courseId);
  
      let reactionStyle;
      if (reactionType === 'thumbsUp' || reactionType === 'smile') {
        reactionStyle = 'positive';
      } else if (reactionType === 'thumbsDown' || reactionType === 'angry') {
        reactionStyle = 'negative';
      } else {
        reactionStyle = 'neutral';
      }
  
      const response = await axios.put(`http://localhost:3001/api/modules/${moduleId}/courses/${courseId}/reactions`, { userId, reactionType, reactionStyle });
      if (response.status === 200) {
        const newReactions = { ...reactions };
        const newUserReactions = { ...userReactions };
  
        // Décrémenter la réaction précédente de l'utilisateur s'il en avait une
        Object.keys(userReactions).forEach((key) => {
          if (userReactions[key] && key !== reactionType) {
            newReactions[key]--;
            newUserReactions[key] = false;
          }
        });
  
        // Mettre à jour la nouvelle réaction de l'utilisateur
        if (!userReactions[reactionType]) {
          newReactions[reactionType]++;
          newUserReactions[reactionType] = true;
        } else {
          // Si l'utilisateur avait déjà cette réaction, la décrémenter
          newReactions[reactionType]--;
          newUserReactions[reactionType] = false;
        }
        
        setUserReactions(newUserReactions);
        setReactions(newReactions);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du nombre de réactions de l\'utilisateur :', error);
    }
  };
  

  return (
    <div>
      <button onClick={() => handleReaction('thumbsUp')}>
        <FaThumbsUp /> {reactions.thumbsUp}
      </button>
      <button onClick={() => handleReaction('thumbsDown')}>
        <FaThumbsDown /> {reactions.thumbsDown}
      </button>
      <button onClick={() => handleReaction('smile')}>
        <FaSmile /> {reactions.smile}
      </button>
      <button onClick={() => handleReaction('angry')}>
        <FaAngry /> {reactions.angry}
      </button>
      <button onClick={() => handleReaction('question')}>
        <FaQuestion /> {reactions.question}
      </button>
    </div>
  );
};

export default ReactionButtons;
