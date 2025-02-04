import React, { useEffect } from 'react';
import './ModuleEntryPopup.css'; // Créez un fichier CSS pour personnaliser ce composant

const ModuleEntryPopup = ({ content, onClose, onValidate, userId }) => {
  // Affiche le userId en console lorsque le composant est monté ou mis à jour
  useEffect(() => {
    console.log('moduleEntryPopup user :', userId);
  }, [userId]);
  

  return (
    <div className="module-entry-popup-overlay">
      <div className="module-entry-popup-content">
        <h3>Contenu du Module</h3>
        <p>{content}</p>
        <div className="module-entry-popup-actions">
          <button onClick={onValidate}>Valider</button>
          <button onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default ModuleEntryPopup;
