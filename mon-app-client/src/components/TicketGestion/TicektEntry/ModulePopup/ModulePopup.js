import React from 'react';
import './ModulePopup.css'; // Assurez-vous de définir le style de la popup

const ModulePopup = ({ content, onClose }) => {
  return (
    <div className="module-popup-overlay">
      <div className="module-popup-content">
        <h3>Contenu du Module</h3>
        <p>{content}</p> {/* Affichage complet du contenu */}
        <button onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
};

export default ModulePopup;
