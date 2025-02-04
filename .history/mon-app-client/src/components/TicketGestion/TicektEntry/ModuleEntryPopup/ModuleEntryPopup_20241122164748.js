import React, { useEffect } from 'react';
import './ModuleEntryPopup.css';

const ModuleEntryPopup = ({ content, moduleId, onClose, onValidate, userId }) => {
  useEffect(() => {
    console.log('Module ID reçu :', moduleId);
    console.log('Contenu reçu :', content);
  }, [moduleId, content]);

  return (
    <div className="module-entry-popup-overlay">
      <div className="module-entry-popup-content">
        <h3>Module Détails</h3>
        <p><strong>ID du Module :</strong> {moduleId}</p>
        <p><strong>Contenu :</strong> {content}</p>
        <p><strong>User ID :</strong> {userId}</p>
        <div className="module-entry-popup-actions">
          <button onClick={onValidate}>Valider</button>
          <button onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default ModuleEntryPopup;
