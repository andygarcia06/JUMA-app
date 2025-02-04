import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModuleSuggestion = ({ userInput, onModuleSelection }) => {
  const [moduleStats, setModuleStats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Rechercher les suggestions de modules chaque fois que userInput change
    if (userInput.trim()) {
      fetchModuleSuggestions(userInput);
    }
  }, [userInput]);

  // Fonction pour récupérer les suggestions et statistiques de modules depuis l'API
  const fetchModuleSuggestions = (query) => {
    setLoading(true);
    axios.get(`http://localhost:3001/api/suggestions/suggestModules`, { params: { query } })
      .then(response => {
        setModuleStats(response.data);  // Stocker les statistiques de modules
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des suggestions de modules:', error);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="module-suggestion">
      <h4>Modules les plus consultés</h4>
      <p>module_1728643938449 : 80%</p>
      <p>module_1730305077324 : 10%</p>
      <p>module_1728053789072 : 10%</p>
    </div>
  );
};

export default ModuleSuggestion;
