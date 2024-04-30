import React, { useState, useEffect } from 'react';

const TicketConditionItem = ({ condition, onAdd, onRemove, onUpdate,selectedOptions  }) => {
  // Déstructurez les valeurs du condition reçu des props
  console.log("Props dans TicketConditionItem: ", { condition, selectedOptions });

  const handleFirstSelectChange = (e) => {
    onUpdate({
      ...condition,
      firstSelectValue: e.target.value,
    });
  };

  const handleSecondSelectChange = (e) => {
    onUpdate({
      ...condition,
      secondSelectValue: e.target.value,
    });
  };

  const handleThirdSelectChange = (e) => {
    onUpdate({
      ...condition,
      thirdSelectValue: e.target.value,
    });
  };

  const handleHoursElapsedChange = (e) => {
    onUpdate({
      ...condition,
      hoursElapsed: e.target.value,
    });
  };

  return (
    <div className="condition">
      <select onChange={handleFirstSelectChange} value={condition.firstSelectValue}>
        <option value="">Sélectionnez une condition</option>
        {selectedOptions.firstSelectOptions && selectedOptions.firstSelectOptions.map(option => (
    <option key={option} value={option}>{option}</option>
  ))}
        <option value="qualification">Tickets : Qualification avancée</option>
        <option value="statut">Tickets : Statut</option>
        <option value="temps">Tickets : Temps écoulé depuis affectation</option>
      </select>
      {condition.firstSelectValue === 'temps' ? (
        <input
          type="number"
          placeholder="Heures écoulées"
          className="timePrompt"
          onChange={handleHoursElapsedChange}
          value={condition.hoursElapsed} // Assurez-vous de lier la valeur de l'input
        />
      ) : (
        <select onChange={handleSecondSelectChange} value={condition.secondSelectValue}>
        {selectedOptions.secondSelectOptions && selectedOptions.secondSelectOptions.map(option => (
  <option key={option} value={option}>{option}</option>
))}
          <option>Est</option>
          <option>N'est pas</option>
          
        </select>
      )}
      {condition.firstSelectValue && condition.firstSelectValue !== 'temps' && (
        <select onChange={handleThirdSelectChange} value={condition.thirdSelectValue}>
        {selectedOptions.thirdSelectOptions && selectedOptions.thirdSelectOptions.map(option => (
      <option key={option} value={option}>{option}</option>
    ))}
          <option>Résolu</option>
          <option>Clos</option>
          <option>Non résolu</option>
          {/* Ajouter d'autres options ici si nécessaire */}
        </select>
      )}
      <button className="icon-button remove-button" onClick={onRemove}>
        -
      </button>
    </div>
  );
};

export default TicketConditionItem;
