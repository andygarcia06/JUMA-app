import React, { useState } from 'react';
import axios from 'axios'; // Importer Axios


const AddProjectPopup = ({ 
  newProjectName, 
  setNewProjectName, 
  projectParticipants, 
  setProjectParticipants, 
  projectStartDate, 
  setProjectStartDate, 
  projectEndDate, 
  setProjectEndDate, 
  companyMembers,
  programId,
  programParticipants={programParticipants} 

}) => {
  const [showPopup, setShowPopup] = useState(false);

  const handleTogglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleAddParticipant = (userId) => {
    if (!projectParticipants.includes(userId)) {
      setProjectParticipants([...projectParticipants, userId]);
    }
  };

  const handleRemoveParticipant = (userId) => {
    setProjectParticipants(projectParticipants.filter(id => id !== userId));
  };

  const handleSaveProject = async () => {
    try {
      // Créer un objet représentant le nouveau projet
      const newProject = {
        projectName: newProjectName,
        participants: projectParticipants,
        startDate: projectStartDate,
        endDate: projectEndDate
      };
  
      // Envoyer une requête POST pour enregistrer le projet
      await axios.post('/api/program/' + programId + '/projects', newProject);
  
      // Réinitialiser les valeurs des états
      setNewProjectName('');
      setProjectParticipants([]);
      setProjectStartDate('');
      setProjectEndDate('');
  
      // Fermer la popup
      handleTogglePopup();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du projet :', error);
      // Afficher un message d'erreur à l'utilisateur, si nécessaire
    }
  };

  return (
    <div>
      <button onClick={handleTogglePopup}>Ajouter un projet</button>
      {showPopup && (
        <div className="popup">
          <h2>Ajouter un nouveau projet</h2>
          <label>Nom du projet:</label>
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
          <label>Date de début:</label>
          <input
            type="date"
            value={projectStartDate}
            onChange={(e) => setProjectStartDate(e.target.value)}
          />
          <label>Date de fin:</label>
          <input
            type="date"
            value={projectEndDate}
            onChange={(e) => setProjectEndDate(e.target.value)}
          />
          <label>Participants:</label>
          <ul>
              {programParticipants.map(participant => (
                <li key={participant.userId}>
                  <input
                    type="checkbox"
                    checked={projectParticipants.includes(participant.userId)}
                    onChange={() => {
                      if (projectParticipants.includes(participant.userId)) {
                        handleRemoveParticipant(participant.userId);
                      } else {
                        handleAddParticipant(participant.userId);
                      }
                    }}
                  />
                  {participant.email}
                </li>
              ))}
            </ul>
          <button onClick={handleSaveProject}>Enregistrer</button>
          <button onClick={handleTogglePopup}>Annuler</button>
        </div>
      )}
    </div>
  );
};

export default AddProjectPopup;
