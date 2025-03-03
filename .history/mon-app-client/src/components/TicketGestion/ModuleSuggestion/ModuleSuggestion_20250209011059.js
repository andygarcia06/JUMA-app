import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ModuleSuggestion = ({ ticketId }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ticketId) {
      fetchSuggestions(ticketId);
    }
  }, [ticketId]);

  const fetchSuggestions = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/compare/${id}`);
      setSuggestions(response.data);
    } catch (err) {
      setError('Erreur lors de la récupération des suggestions');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="module-suggestion">
      <h4>Suggestions de Modules</h4>
      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <h5>Modules correspondants :</h5>
          {suggestions.matchingModules && suggestions.matchingModules.length > 0 ? (
            suggestions.matchingModules.map((module, index) => (
              <p key={index}>{module.name}</p> // Assurez-vous que 'name' est un champ valide
            ))
          ) : (
            <p>Aucun module correspondant trouvé.</p>
          )}
          <h5>ModuleTickets correspondants :</h5>
          {suggestions.matchingModuleTickets && suggestions.matchingModuleTickets.length > 0 ? (
            suggestions.matchingModuleTickets.map((mt, index) => (
              <p key={index}>{mt.name}</p> // Assurez-vous que 'name' est un champ valide
            ))
          ) : (
            <p>Aucun ModuleTicket correspondant trouvé.</p>
          )}
        </>
      )}
    </div>
  );
};

export default ModuleSuggestion;
