import React, { useState } from 'react';

import './SatisfactionConditionList.css'

function SatisfactionConditionList({selectedTicket}) {
  // État local pour stocker la liste des conditions
  const [conditions, setConditions] = useState([]);
  console.log("Ticket sélectionné dans SatisfactionConditionList :", selectedTicket);
  // Fonction pour ajouter une nouvelle condition à la liste
  const addCondition = () => {
    // Créez une nouvelle condition avec les options spécifiées
    const newCondition = {
      select1: 'canal',
      select2: 'est',
      select3: 'wechat',
    };

    // Ajoutez la nouvelle condition à la liste existante
    setConditions([...conditions, newCondition]);
  };

  // Fonction pour supprimer une condition
  const removeCondition = (index) => {
    const updatedConditions = [...conditions];
    updatedConditions.splice(index, 1);
    setConditions(updatedConditions);
  };

  return (
    <div>
      <h4>Répondre à l'une des conditions suivantes :</h4>
      {conditions.map((condition, index) => (
        <div key={index} className="condition">
          <select value={condition.select1}>
            <option value="canal">Canal</option>
          </select>
          <select value={condition.select2}>
            <option value="est">Est</option>
            <option value="n-est-pas">N'est pas</option>
          </select>
          <select value={condition.select3}>
            <option value="wechat">WeChat</option>
            <option value="line">Line</option>
            <option value="whatsapp">Whatsapp</option>
            <option value="facebookmessenger">FacebookMessenger</option>
            <option value="messagedirecttwiter">Message direct Twiter</option>
          </select>
          <button className='deleteSign' onClick={() => removeCondition(index)}>-</button>
        </div>
      ))}
      <button onClick={addCondition}>Ajouter une condition</button>
    </div>
  );
}

export default SatisfactionConditionList;
