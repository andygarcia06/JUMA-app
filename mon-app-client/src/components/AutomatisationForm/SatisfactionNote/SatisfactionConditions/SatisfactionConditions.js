import React from 'react';

function SatisfactionConditions() {
  return (
    <div>
      <h3>Conditions</h3>
      <p>Conditions devant être exécutées pour que le déclencheur s'exécute</p>
      <h4>Répondre à toutes les conditions suivantes :</h4>
      <select>
        <option value="statut">Statut</option>
        {/* Ajoutez d'autres options ici si nécessaire */}
      </select>
      <select>
        <option value="changée en">Changée en</option>
        {/* Ajoutez d'autres options ici si nécessaire */}
      </select>
      <select>
        <option value="resolu">Résolu</option>
        <option value="resolu">Non résolu</option>
      </select>
    </div>
  );
}

export default SatisfactionConditions;
