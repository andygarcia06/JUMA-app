import React, { useState } from 'react';

import "../AddingCondition/AddCondition.css"


const SendNotification = () => {
    const [selectedOption, setSelectedOption] = useState('');
const [customValue, setCustomValue] = useState('');

const handleOptionChange = (e) => {
  const selectedValue = e.target.value;
  setSelectedOption(selectedValue);

  // Si l'option "Autre" est sélectionnée, réinitialisez la valeur personnalisée
  if (selectedValue !== 'autre') {
    setCustomValue('');
  }
};

  return (
    <div className="action-selects">
      <select>
        <option value="notification">Notification</option>
        <option value="envoyer-email">Envoyer par email à</option>
      </select>
      <select>
        <option value="demandeur">Demandeur</option>
        <option value="cc">CC</option>
        <option value="autre"><input type="text" placeholder="Entrez un email" /></option>

      </select>

      {/* Zone d'entrée pour le sujet de l'email */}
      <div>
        <h4>Sujet de l'email</h4>
        <input className='email-subject' type="text" placeholder="Entrez le sujet de l'email" />
      </div>

      {/* Zone d'entrée pour le texte de l'email */}
      <div>
        <h4>Texte de l'email</h4>
        <textarea placeholder="Entrez le texte de l'email" rows="4" />
      </div>
    </div>
  );
};

export default SendNotification;
