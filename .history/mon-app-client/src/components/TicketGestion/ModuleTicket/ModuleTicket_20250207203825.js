import React, { useState } from 'react';
import axios from 'axios';

const CreateModuleTicket = ({ ticketId, userId }) => {
  const [moduleContent, setModuleContent] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!moduleContent.trim()) {
      setMessage('Le contenu du module ne peut pas être vide.');
      return;
    }

    try {
      // 1️⃣ Création du module
      const moduleResponse = await axios.post('/api/moduleTicket', {
        ticketId,
        userId,
        content: moduleContent
      });

      const moduleId = moduleResponse.data.id; // Récupération de l'ID du module

      console.log('✅ Module créé:', moduleResponse.data);

      // 2️⃣ Envoi du message dans la messagerie
      await axios.post(`/api/tickets/${ticketId}/messages`, {
        userId,
        content: `🎓 Un nouveau module e-learning a été ajouté : ${moduleContent}`,
        type: 'module',
        moduleId
      });

      console.log('✅ Message ajouté à la messagerie.');

      // Réinitialisation du formulaire et message de confirmation
      setModuleContent('');
      setMessage('Module soumis et ajouté à la messagerie !');

    } catch (error) {
      console.error('❌ Erreur lors de la création du module:', error);
      setMessage('Erreur lors de la soumission du module.');
    }
  };

  return (
    <div className="create-module-ticket">
      <h3>Créer une entrée Elearning pour ce ticket</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={moduleContent}
          onChange={(e) => setModuleContent(e.target.value)}
          placeholder="Tapez votre module ici..."
          rows="5"
        />
        <button type="submit">Soumettre l'entrée Elearning</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateModuleTicket;
