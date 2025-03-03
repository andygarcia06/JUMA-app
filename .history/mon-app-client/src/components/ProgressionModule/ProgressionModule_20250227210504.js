import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProgressionModule.css';

const ProgressionModule = ({ userId }) => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgression = async () => {
      try {
        await axios.post(`http://localhost:3001/api/user/${userId}/update-progression`);
        const response = await axios.get(`http://localhost:3001/api/user/${userId}/progression`);
        setProgressData(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération de la progression :', error);
        setError('Impossible de récupérer la progression.');
      } finally {
        setLoading(false);
      }
    };

    fetchProgression();
  }, [userId]);

  if (loading) return <p>Chargement de la progression...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!progressData) return <p>Aucune donnée de progression disponible.</p>;

  // Filtrer uniquement les modules où il y a une progression (au moins 1 cours validé)
  const modulesWithProgress = progressData.modules.filter(module => module.validatedCourses.length > 0);

  return (
    <div className="progression-module">
      <h2>📈 Progression de {progressData.username}</h2>
      <p>Entreprise : {progressData.company}</p>
      <h3>Modules suivis (avec progression) :</h3>
      {modulesWithProgress.length === 0 ? (
        <p>Aucun module en cours de progression.</p>
      ) : (
        modulesWithProgress.map(module => (
          <div key={module.moduleId} className="module-progress">
            <h4>{module.moduleName}</h4>
            <p>{module.validatedCourses.length} / {module.totalCourses} cours validés</p>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: module.progress }}
              >
                {module.progress}
              </div>
            </div>
            <button onClick={() => {
              // Par exemple, ouvrir une modal pour consulter le module
              // Vous pouvez gérer l'ouverture d'une modal ici, en passant l'ID du module
            }}>
              Consulter module
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ProgressionModule;
