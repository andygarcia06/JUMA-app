import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModuleSuggestion = ({ userInput, onModuleSelection }) => {
  const [moduleSuggestions, setModuleSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userInput.trim()) {
      fetchModuleSuggestions(userInput);
    }
  }, [userInput]);

  const fetchModuleSuggestions = async (query) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/suggestions/suggestModules', {
        params: { query },
      });
      setModuleSuggestions(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions de modules:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="module-suggestion">
      <h4>Modules suggérés</h4>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <ul>
          {moduleSuggestions.map((module) => (
            <li key={module.id} onClick={() => onModuleSelection(module)}>
              {module.name} : {module.percentage}%
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ModuleSuggestion;
