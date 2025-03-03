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
        // Vous pouvez d'abord appeler la route POST pour mettre à jour la progression,
        // puis la route GET pour la récupérer. Ici, on suppose que la mise à jour a été faite.
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

  return (
    <div className="progression-module">
      <h2>📈 Progression de {progressData.username}</h2>
      <p>Entreprise : {progressData.company}</p>
      <h3>Modules suivis :</h3>
      {progressData.modules.map(module => (
        <div key={module.moduleId} className="module-progress">
          <h4>{module.moduleName}</h4>
          <p>
            {module.validatedCourses.length} / {module.totalCourses} cours validés
          </p>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: module.progress }}
            >
              {module.progress}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressionModule;
