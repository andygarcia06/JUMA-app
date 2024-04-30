import React, { useState } from 'react';
import axios from 'axios';

const AddBRPopup = ({ projectId, lotId, handleClosePopup, participants }) => {
  const [brName, setBRName] = useState('');
  const [brDescription, setBRDescription] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  const handleAddBR = async () => {
    try {
      const newBR = {
        brName: brName,
        brDescription: brDescription,
        participants: selectedParticipants,
        projectId : projectId,
        lotId : lotId,
      };
  
      // Vérifier si projectId et lotId sont définis
      if (!projectId || !lotId) {
        console.error('projectId ou lotId non défini');
        return;
      }
  
      // Utiliser les valeurs de projectId et lotId dans la requête axios
      await axios.post(`http://localhost:3001/api/projects/${projectId}/lots/${lotId}/brs`, newBR);
  
      // Réinitialiser les valeurs des états
      setBRName('');
      setBRDescription('');
      setSelectedParticipants([]);
  
      // Fermer la popup
      handleClosePopup();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du BR :', error);
      // Afficher un message d'erreur à l'utilisateur, si nécessaire
    }
  };

  const handleToggleParticipant = (email) => {
    if (selectedParticipants.includes(email)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== email));
    } else {
      setSelectedParticipants([...selectedParticipants, email]);
    }
  };

  return (
    <div className="popup">
      <h2>Ajouter un nouveau BR</h2>
      <label>Nom du BR:</label>
      <input
        type="text"
        value={brName}
        onChange={(e) => setBRName(e.target.value)}
      />
      <label>Description du BR:</label>
      <textarea
        type="text"
        value={brDescription}
        onChange={(e) => setBRDescription(e.target.value)}
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
      <button onClick={handleAddBR}>Enregistrer</button>
      <button onClick={handleClosePopup}>Annuler</button>
    </div>
  );
};

export default AddBRPopup;
