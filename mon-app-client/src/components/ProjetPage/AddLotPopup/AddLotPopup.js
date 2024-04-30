import React, { useState } from 'react';
import axios from 'axios';

const AddLotPopup = ({ projectId, participants, handleClosePopup, endDate, startDate }) => {
  const [lotName, setLotName] = useState('');
  const [lotDescription, setLotDescription] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  const handleAddLot = async () => {
    try {
      const newLot = {
        lotName: lotName,
        lotDescription: lotDescription,
        participants: selectedParticipants,
      };

      await axios.post(`http://localhost:3001/api/projects/${projectId}/lots`, newLot);

      // Réinitialiser les valeurs des états
      setLotName('');
      setLotDescription('');
      setSelectedParticipants([]);

      // Fermer la popup
      handleClosePopup();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du lot :', error);
      // Afficher un message d'erreur à l'utilisateur, si nécessaire
    }
  };

  const handleToggleParticipant = (email) => {
    if (selectedParticipants.includes(email)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== email));
      console.log(endDate, startDate)

    } else {
      setSelectedParticipants([...selectedParticipants, email]);
    }
  };

  return (
    <div className="popup">
      <h2>Ajouter un nouveau lot</h2>
      <label>Nom du lot:</label>
      <input
        type="text"
        value={lotName}
        onChange={(e) => setLotName(e.target.value)}
      />
      <label>Description du lot:</label>
      <textarea
        type="text"
        value={lotDescription}
        onChange={(e) => setLotDescription(e.target.value)}
      />
      <label>Participants:</label>
      <ul>
        {participants.map(email => (
          <li key={email}>
            <input
              type="checkbox"
              checked={selectedParticipants.includes(email)}
              onChange={() => handleToggleParticipant(email)}
            />
            {email}
          </li>
        ))}
      </ul>
      <button onClick={handleAddLot}>Enregistrer</button>
      <button onClick={handleClosePopup}>Annuler</button>
    </div>
  );
};

export default AddLotPopup;
