import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProgressionModule.css';

const ProgressionModule = ({ userId }) => {
  const [progression, setProgression] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgression = async () => {
      try {
        const response = await axios.get(`/api/users/${userId}/progression`);
        setProgression(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération de la progression :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgression();
  }, [userId]);

  if (loading) return <p>Chargement de la progression...</p>;

  return (
    <div className="progression-module">
      <h2>📈 Progression des Modules</h2>
      {progression.length > 0 ? (
        progression.map(module => (
          <div key={module.moduleId} className="progress-bar-container">
            <h3>{module.moduleName}</h3>
            <p>{module.validatedCourses} cours validés</p>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${module.progress}%` }}>
                {module.progress}%
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>Aucune progression disponible.</p>
      )}
    </div>
  );
};

export default ProgressionModule;
