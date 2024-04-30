import React from 'react';

// Sous-composant pour l'en-tête
function SatisfactionHeader() {
  return (
    <div>
      <h2>Demander une note de satisfaction</h2>
      <h3>Nom du déclencheur</h3>
      <input
        type="text"
        placeholder="Demander une note de satisfaction client"
      />
      <h3>Description</h3>
      <input
        type="textarea"
        placeholder="Demander au client de noter la conversation une fois qu'elle est terminée, ce déclencheur est créé par le système"
      />
      <h3>Catégorie</h3>
      <select>
        <option value="affectation">Affectation</option>
      </select>
    </div>
  );
}

export default SatisfactionHeader;