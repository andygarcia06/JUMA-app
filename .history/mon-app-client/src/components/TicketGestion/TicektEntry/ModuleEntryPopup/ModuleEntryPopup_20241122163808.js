import React, { useEffect } from 'react';
import './ModuleEntryPopup.css';

const ModuleEntryPopup = ({ content, moduleId, onClose, onValidate, userId }) => {
  useEffect(() => {
    console.log('moduleEntryPopup user :', userId);
    console.log('moduleEntryPopup moduleId :', moduleId);
  }, [userId, moduleId]);

  return (
    <div className="module-entry-popup-overlay">
      <div className="module-entry-popup-content">
        <h3>Contenu du Module</h3>
        <p><strong>Module ID :</strong> {moduleId}</p>
        <p>{content}</p>
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
