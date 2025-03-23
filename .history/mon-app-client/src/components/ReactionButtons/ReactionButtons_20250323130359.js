import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaThumbsUp, FaThumbsDown, FaSmile, FaAngry, FaQuestion } from 'react-icons/fa';

const ReactionButtons = ({ userId, moduleId, courseId }) => {
  // Comptes globaux des réactions
  const [reactions, setReactions] = useState({
    thumbsUp: 0,
    thumbsDown: 0,
    smile: 0,
    angry: 0,
    question: 0
  });
  // La réaction actuelle de l'utilisateur (null si aucune)
  const [userReaction, setUserReaction] = useState(null);

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        console.log('[ReactionButtons] Récupération des réactions pour moduleId:', moduleId, 'courseId:', courseId);
        const response = await axios.get(`/api/modules/${moduleId}/courses/${courseId}/reactions`);
        if (response.status === 200) {
          const data = Array.isArray(response.data) ? response.data : [];
          console.log('[ReactionButtons] Réactions récupérées:', data);
          updateReactionsCount(data);
          const currentReaction = data.find(r => r.userId === userId);
          setUserReaction(currentReaction ? currentReaction.reactionType : null);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.warn('[ReactionButtons] Route non trouvée, initialisation des réactions à []');
          updateReactionsCount([]);
          setUserReaction(null);
        } else {
          console.error('[ReactionButtons] Erreur lors de la récupération des réactions :', error);
        }
      }
    };

    fetchReactions();
  }, [moduleId, courseId, userId]);

  const updateReactionsCount = (data) => {
    const counts = {
      thumbsUp: data.filter(r => r.reactionType === 'thumbsUp').length,
      thumbsDown: data.filter(r => r.reactionType === 'thumbsDown').length,
      smile: data.filter(r => r.reactionType === 'smile').length,
      angry: data.filter(r => r.reactionType === 'angry').length,
      question: data.filter(r => r.reactionType === 'question').length,
    };
    setReactions(counts);
  };

  const handleReaction = async (reactionType) => {
    try {
      console.log('[ReactionButtons] Réaction cliquée:', reactionType);
      // Si l'utilisateur a déjà sélectionné cette réaction, on la retire (toggle off)
      const newReaction = userReaction === reactionType ? null : reactionType;

      // Définir le style de la réaction (positive, négative, ou neutre)
      const reactionStyle =
        reactionType === 'thumbsUp' || reactionType === 'smile'
          ? 'positive'
          : (reactionType === 'thumbsDown' || reactionType === 'angry')
          ? 'negative'
          : 'neutral';

      // Envoi de la mise à jour vers le backend
      const response = await axios.put(
        `/api/modules/${moduleId}/courses/${courseId}/reactions`,
        { userId, reactionType: newReaction, reactionStyle }
      );
      if (response.status === 200) {
        // On rafraîchit les réactions après mise à jour
        const res = await axios.get(`/api/modules/${moduleId}/courses/${courseId}/reactions`);
        const updatedData = Array.isArray(res.data) ? res.data : [];
        updateReactionsCount(updatedData);
        const currentReaction = updatedData.find(r => r.userId === userId);
        setUserReaction(currentReaction ? currentReaction.reactionType : null);
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
