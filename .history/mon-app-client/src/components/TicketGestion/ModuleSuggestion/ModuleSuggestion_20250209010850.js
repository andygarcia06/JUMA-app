import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModuleSuggestion = ({ ticketDetail, onModuleSelection }) => {
  const [suggestedModules, setSuggestedModules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticketDetail && ticketDetail.trim()) {
      fetchModuleSuggestions(ticketDetail);
    }
  }, [ticketDetail]);

  const fetchModuleSuggestions = (query) => {
    setLoading(true);
    axios.get(`http://localhost:3001/api/suggestions/compareModules`, { params: { query } })
      .then(response => {
        setSuggestedModules(response.data);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des suggestions de modules:', error);
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
            <p key={index}>{module.name}</p>
          ))
        ) : (
          <p>Aucun module correspondant trouvé.</p>
        )
      )}
    </div>
  );
};

export default ModuleSuggestion;
