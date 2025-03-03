import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MostViewedModulesByCompany = ({ userId }) => {
  const [mostViewedModules, setMostViewedModules] = useState([]); // Initialisation avec un tableau vide
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Ajout d'un état pour gérer les erreurs

  useEffect(() => {
    const fetchMostViewedModules = async () => {
      try {
        // Appel à l'API backend
        const response = await axios.get(`/api/user/${userId}/most-viewed-modules`);
        
        // Vérification que la réponse contient bien un tableau
        if (Array.isArray(response.data)) {
          setMostViewedModules(response.data);
        } else {
          console.error("Données reçues invalides :", response.data);
          setMostViewedModules([]); // Définit un tableau vide en cas de problème
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des modules :", error);
        setError("Impossible de charger les modules.");
      } finally {
        setLoading(false);
      }
    };

    fetchMostViewedModules();
  }, [userId]);

  if (loading) {
    return <p>Chargement des modules les plus populaires...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className="most-viewed-modules">
      <h2>📊 Modules les plus populaires dans votre entreprise</h2>
      <ul>
        {mostViewedModules.length > 0 ? (
          mostViewedModules.map(module => (
            <li key={module.id}>
              <h3>{module.title}</h3>
              <p>{module.courses ? module.courses.length : 0} cours - Réactions : {module.reactions ? module.reactions.length : 0}</p>
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
