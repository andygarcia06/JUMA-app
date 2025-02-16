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

  const fetchModuleSuggestions = async (ticketId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/compare/${ticketId}`);
      let { matchingModules, matchingModuleTickets } = response.data;

      // Ajouter un champ 'similarity' aux objets modules pour pouvoir trier
      const allResults = [...matchingModules, ...matchingModuleTickets];

      // Trier par similarité décroissante
      const sortedResults = allResults
        .filter(module => module.similarity !== undefined) // Vérifie que la similarité existe
        .sort((a, b) => b.similarity - a.similarity) // Tri décroissant

        .slice(0, 3); // Prend les 3 meilleurs résultats

      setSuggestedModules(sortedResults);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des suggestions de modules :', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="module-suggestion">
      <h4>📌 Modules suggérés</h4>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        suggestedModules.length > 0 ? (
          suggestedModules.map((module, index) => (
            <div key={index} onClick={() => onModuleSelection(module)} className="module-item">
              <p><strong>{module.name || module.title}</strong></p>
              <p>🔍 Similarité : {module.similarity.toFixed(2)}%</p>
            </div>
          ))
        ) : (
          <p>⚠️ Aucun module correspondant trouvé.</p>
        )
      )}
    </div>
  );
};

export default ModuleSuggestion;
