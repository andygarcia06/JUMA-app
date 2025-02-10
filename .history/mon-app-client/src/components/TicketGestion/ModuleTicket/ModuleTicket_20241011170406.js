import React, { useState } from 'react';
import axios from 'axios';

const CreateModuleTicket = ({ ticketId, userId }) => {
  const [moduleContent, setModuleContent] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!moduleContent.trim()) {
      setMessage('Le contenu du module ne peut pas être vide.');
      return;
    }

    axios.post('http://localhost:3001/api/moduleTicket', {
      ticketId,
      userId,
      content: moduleContent
    })
      .then(response => {
        setMessage('Module créé avec succès.');
        setModuleContent('');
      })
      .catch(error => {
        console.error('Erreur lors de la création du module:', error);
        setMessage('Erreur lors de la création du module.');
      });
  };

  return (
    <div className="create-module-ticket">
      <h3>Créer une entrée Elarning pour ce ticket</h3>
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
