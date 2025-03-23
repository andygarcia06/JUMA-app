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
  const [userReactions, setUserReactions] = useState([]);

  useEffect(() => {
    const fetchUserReactions = async () => {
      try {
        console.log('[ReactionButtons] Récupération des réactions pour moduleId:', moduleId, 'courseId:', courseId);
        const response = await axios.get(`/api/modules/${moduleId}/courses/${courseId}/reactions`);
        if (response.status === 200) {
          const data = Array.isArray(response.data) ? response.data : [];
          console.log('[ReactionButtons] Réactions récupérées:', data);
          setUserReactions(data);
          updateReactionsCount(data);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.warn('[ReactionButtons] Route non trouvée, initialisation des réactions à []');
          setUserReactions([]);
          updateReactionsCount([]);
        } else {
          console.error('[ReactionButtons] Erreur lors de la récupération des réactions :', error);
        }
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
    if (!Array.isArray(reactionsData)) return 0;
    return reactionsData.filter(reaction => reaction.reactionType === reactionType).length;
  };

  const handleReaction = async (reactionType) => {
    try {
      console.log('[ReactionButtons] Envoi de la réaction:', reactionType);
      const reactionStyle =
        reactionType === 'thumbsUp' || reactionType === 'smile'
          ? 'positive'
          : (reactionType === 'thumbsDown' || reactionType === 'angry') ? 'negative' : 'neutral';

      const response = await axios.put(
        `/api/modules/${moduleId}/courses/${courseId}/reactions`,
        { userId, reactionType, reactionStyle }
      );
      if (response.status === 200) {
        // On met à jour localement l'état des réactions
        const newUserReactions = [...userReactions];
        // On cherche si l'utilisateur a déjà réagi avec ce type
        const index = newUserReactions.findIndex(r => r.userId === userId && r.reactionType === reactionType);
        if (index === -1) {
          // Ajout de la nouvelle réaction
          newUserReactions.push({ userId, reactionType, reactionStyle });
        } else {
          // Si l'utilisateur a déjà réagi, on retire sa réaction
          newUserReactions.splice(index, 1);
        }
        setUserReactions(newUserReactions);
        updateReactionsCount(newUserReactions);
      }
    } catch (error) {
      console.error('[ReactionButtons] Erreur lors de la mise à jour des réactions :', error);
    }
  };

  return (
    <div className="reaction-buttons">
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
