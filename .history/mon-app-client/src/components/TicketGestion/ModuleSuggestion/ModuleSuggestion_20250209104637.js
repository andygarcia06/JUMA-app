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
      const response = await axios.get(`http://localhost:3001/api/compare/${ticketId}`);
      console.log("📌 Données reçues du serveur :", response.data); // ✅ Log des données reçues pour vérification

      let { matchingModules } = response.data;

      // Vérification des données
      if (!matchingModules || matchingModules.length === 0) {
        setSuggestedModules([]);
        return;
      }

      // Trier par similarité décroissante et garder les 3 meilleurs
      const sortedResults = matchingModules
        .sort((a, b) => b.similarity - a.similarity) // Tri décroissant par similarité
        .slice(0, 3); // Garde les 3 meilleurs

      setSuggestedModules(sortedResults);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des suggestions de modules :', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="module-suggestion">
      <h4>📌 Knowledge Management</h4>
      {loading ? (
        <p>Chargement...</p>
      ) : suggestedModules.length > 0 ? (
        suggestedModules.map((module, index) => (
          <div key={module.id} onClick={() => onModuleSelection(module)} className="module-item">
            <p><strong>Module ID: {module.id}</strong></p>
            <p>📅 Créé le: {new Date(module.createdAt).toLocaleString()}</p>
            <p>🔍 Similarité: {module.similarity.toFixed(2)}%</p>
            <p>📝 Contenu: {module.content.substring(0, 100)}...</p> {/* Affiche un extrait du contenu */}
          </div>
        ))
      ) : (
        <p>⚠️ Aucun module correspondant trouvé.</p>
      )}
    </div>
  );
};

export default ModuleSuggestion;
