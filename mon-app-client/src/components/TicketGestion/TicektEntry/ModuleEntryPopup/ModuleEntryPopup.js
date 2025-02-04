import React, { useEffect } from 'react';
import './ModuleEntryPopup.css';
import axios from 'axios';

const ModuleEntryPopup = ({ content, moduleId, onClose, userId }) => {
  useEffect(() => {
    console.log('Module ID reçu :', moduleId);
    console.log('Contenu reçu :', content);
  }, [moduleId, content]);

  const handleValidateClick = async () => {
    try {
      // Appeler l'API backend pour valider le module
      const response = await axios.post(`http://localhost:3001/api/users/${userId}/validateCourse`, {
        moduleId: moduleId,  // Passer l'ID du module
      });
      
      console.log('Cours validé:', response.data);
      // Fermer la popup après validation
      onClose();  

      // Vous pouvez également mettre à jour l'UI ici (comme la barre de progression ou le compteur de cours validés)
    } catch (error) {
      console.error('Erreur lors de la validation du module:', error);
    }
  };

  return (
    <div className="module-entry-popup-overlay">
      <div className="module-entry-popup-content">
        <h3>Module Détails</h3>
        <p><strong>ID du Module :</strong> {moduleId}</p>
        <p><strong>Contenu :</strong> {content}</p>
        <p><strong>User ID :</strong> {userId}</p>
        <div className="module-entry-popup-actions">
          <button onClick={handleValidateClick}>Valider</button>
          <button onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default ModuleEntryPopup;
