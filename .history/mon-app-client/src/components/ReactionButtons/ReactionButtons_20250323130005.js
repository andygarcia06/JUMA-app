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
  // La réaction actuelle de l'utilisateur (null s'il n'a pas réagi)
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
          // Trouver la réaction de l'utilisateur
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
      question: data.filter(r => r.reactionType === 'question').length
    };
    setReactions(counts);
  };

  const handleReaction = async (reactionType) => {
    try {
      console.log('[ReactionButtons] Réaction cliquée:', reactionType);
      // Déterminer le style de réaction
      const reactionStyle = (reactionType === 'thumbsUp' || reactionType === 'smile')
        ? 'positive'
        : ((reactionType === 'thumbsDown' || reactionType === 'angry') ? 'negative' : 'neutral');

      // Définir l'action : s'il a déjà réagi avec ce type, on le retire (toggle off), sinon on le remplace
      const newReaction = (userReaction === reactionType) ? null : reactionType;

      // Envoyer la mise à jour au backend
      const response = await axios.put(
        `/api/modules/${moduleId}/courses/${courseId}/reactions`,
        { userId, reactionType: newReaction, reactionStyle }
      );
      if (response.status === 200) {
        // Mettre à jour localement le compteur global des réactions
        // Pour simplifier, on refait une requête pour récupérer la liste actualisée
        const res = await axios.get(`/api/modules/${moduleId}/courses/${courseId}/reactions`);
        const updatedData = Array.isArray(res.data) ? res.data : [];
        updateReactionsCount(updatedData);
        // Mettre à jour la réaction de l'utilisateur
        const currentReaction = updatedData.find(r => r.userId === userId);
        setUserReaction(currentReaction ? currentReaction.reactionType : null);
      }
    } catch (error) {
      console.error('[ReactionButtons] Erreur lors de la mise à jour de la réaction :', error);
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
