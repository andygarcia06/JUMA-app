import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModuleSuggestion = ({ ticketId, onModuleSelection }) => {
  const [suggestedModules, setSuggestedModules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticketId) {
      fetchModuleSuggestions(ticketId);
    }
  }, [ticketId]);

  const fetchModuleSuggestions = (ticketId) => {
    setLoading(true);
    axios.get(`http://localhost:3001/api/compare/${ticketId}`)
      .then(response => {
        const { matchingModules, matchingModuleTickets } = response.data;
        // Combiner les résultats si nécessaire
        const combinedResults = [...matchingModules, ...matchingModuleTickets];
        setSuggestedModules(combinedResults);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des suggestions de modules :', error);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="module-suggestion">
      <h4>Modules suggérés</h4>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        suggestedModules.length > 0 ? (
          suggestedModules.map((module, index) => (
            <div key={index} onClick={() => onModuleSelection(module)}>
              <p>{module.name}</p>
            </div>
          ))
        ) : (
          <p>Aucun module correspondant trouvé.</p>
        )
      )}
    </div>
  );
};

export default ModuleSuggestion;
