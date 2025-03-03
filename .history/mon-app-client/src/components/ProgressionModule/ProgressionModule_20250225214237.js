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
      <h2>📈 Progression de {progressData.username} </h2>
      <p>Entreprise : {progressData.company}</p>
      <div className="progress-bar-container">
        <div
          className="progress-bar"
          style={{ width: `${progressData.progress}` }}
        >
          {progressData.progress}
        </div>
      </div>
      <h3>Modules suivis :</h3>
      <ul>
        {progressData.modules.map(module => (
          <li key={module.moduleId} className="module-progress">
            <h4>{module.moduleName}</h4>
            <p>
              Progression : {module.validatedCourses.length} / {module.totalCourses} cours validés
            </p>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${(module.validatedCourses.length / module.totalCourses) * 100}%` }}
              >
                {((module.validatedCourses.length / module.totalCourses) * 100).toFixed(2)}%
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProgressionModule;
