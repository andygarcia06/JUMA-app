import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MostViewedModulesByCompany = ({ userId }) => {
  const [mostViewedModules, setMostViewedModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMostViewedModules = async () => {
      try {
        // Appel à l'API backend
        const response = await axios.get(`/api/user/${userId}/most-viewed-modules`);
        setMostViewedModules(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des modules :", error);
        setLoading(false);
      }
    };

    fetchMostViewedModules();
  }, [userId]);

  if (loading) {
    return <p>Chargement des modules les plus populaires...</p>;
  }

  return (
    <div className="most-viewed-modules">
      <h2>📊 Modules les plus populaires dans votre entreprise</h2>
      <ul>
        {mostViewedModules.length > 0 ? (
          mostViewedModules.map(module => (
            <li key={module.id}>
              <h3>{module.title}</h3>
              <p>{module.courses.length} cours - Réactions : {module.reactions ? module.reactions.length : 0}</p>
            </li>
          ))
        ) : (
          <p>Aucun module avec des interactions de vos collègues.</p>
        )}
      </ul>
    </div>
  );
};

export default MostViewedModulesByCompany;
