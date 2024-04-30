import React, { useState, useEffect } from 'react';
import LastUpdated from './LastUpdated/LastUpdated';
import TicketConditionItem from './TicketConditionItem/TicketConditionItem';
import AddCondition from './AddingCondition/AddCondition';
import SendNotification from './SendNotification/SendNotification';
import SatisfactionNote from './SatisfactionNote/SatisfactionNote';


import './AutomatisationForm.css';
import { useLocation } from 'react-router-dom';

function AutomationForm() {
  const [lastUpdated, setLastUpdated] = useState('');
  const [conditions, setConditions] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState('');
  const location = useLocation();
  const userPseudo = location.state?.userPseudo;

  // Définissez les valeurs par défaut des conditions
  const defaultCondition = {
    firstSelectValue: '',
    secondSelectValue: 'Est',
    thirdSelectValue: 'Résolu',
    hoursElapsed: '',
  };

  const updateOptionsOnly = (newOptions) => {
    updateSelectedOptions('firstSelectOptions', newOptions[0]);
    updateSelectedOptions('secondSelectOptions', newOptions[1]);
    updateSelectedOptions('thirdSelectOptions', newOptions[2]);
};

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString());

    const fetchTickets = async () => {
      try {
        const response = await fetch('http://localhost:3001/tickets');
        const data = await response.json();
        const userTickets = data.filter(ticket => ticket.creator === userPseudo);

        setTickets(userTickets);
      } catch (error) {
        console.error("Erreur lors de la récupération des tickets:", error);
      }
    };

    fetchTickets();
  }, [userPseudo]);

  const addCondition = (newCondition) => {
    console.log("Condition reçue dans AutomatisationForm: ", newCondition);
  
    setConditions(prevConditions => {
      const updatedConditions = Array.isArray(prevConditions) ? [...prevConditions, newCondition] : [newCondition];
      console.log("Conditions mises à jour: ", updatedConditions);
      return updatedConditions;
    });

      // Mettre à jour selectedOptions
  updateSelectedOptions('firstSelectOptions', newCondition[0]);
  updateSelectedOptions('secondSelectOptions', newCondition[1]);
  updateSelectedOptions('thirdSelectOptions', newCondition[2]);

  };
  

const [selectedOptions, setSelectedOptions] = useState({
  firstSelectOptions: [],
  secondSelectOptions: [],
  thirdSelectOptions: []
});

const updateSelectedOptions = (field, value) => {
  setSelectedOptions(prev => ({
    ...prev,
    [field]: [...new Set([...prev[field], value])] // Ajoute et évite les doublons
  }));
};

  const removeCondition = (index) => {
    const updatedConditions = [...conditions];
    updatedConditions.splice(index, 1);
    setConditions(updatedConditions);
  };

  const updateCondition = (index, updatedCondition) => {
    const updatedConditions = [...conditions];
    
    updatedConditions[index] = updatedCondition;
    console.log("Conditions mises à jour: ", updatedConditions);

    setConditions(updatedConditions);
  };

  const updateTicketWithConditions = async () => {
    if (selectedTicket) {
      const ticketToUpdate = tickets.find(ticket => ticket.id === selectedTicket);

      const updatedTicket = {
        ...ticketToUpdate,
        conditions: conditions,
      };

      try {
        await fetch(`http://localhost:3001/tickets/${ticketToUpdate.id}/conditions`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ conditions: updatedTicket.conditions }),
        });
        // Si la mise à jour réussit, vous pouvez afficher un message de confirmation ou effectuer d'autres actions nécessaires.
      } catch (error) {
        console.error("Erreur lors de la mise à jour des conditions:", error);
      }
    }
  };

  return (
    <div className="automation-form">
      <LastUpdated date={lastUpdated} />
      <div className="ticket-selector">
        <label htmlFor="ticketSelect">Choisir un ticket :</label>
        <select id="ticketSelect" onChange={(e) => setSelectedTicket(e.target.value)}>
          <option value="">Sélectionnez un ticket</option>
          {tickets.map((ticket) => (
            <option key={ticket.id} value={ticket.id}>
              {ticket.title}
            </option>
          ))}
        </select>
      </div>
      <h1>Automatisation</h1>
      <p>Configurer vos conditions d'automatisation ci-dessous.</p>

      <div className="conditions">
        {conditions.map((condition, index) => (
          <TicketConditionItem
            key={index}
            selectedOptions={selectedOptions}
            condition={condition}
            onRemove={() => removeCondition(index)}
            onUpdate={(updatedCondition) => updateCondition(index, updatedCondition)}
          />
        ))}
        <button onClick={addCondition}>Ajouter une ligne de condition</button>
        <button onClick={updateTicketWithConditions}>Enregistrer</button>
      </div>



      <AddCondition onUpdateOptionsOnly={updateOptionsOnly} />


      <div className="actions">
        <h3>Exécuter ces actions :</h3>
        <SendNotification />
      </div>
      <SatisfactionNote selectedTicket={selectedTicket} />
    </div>
  );
}

export default AutomationForm;
