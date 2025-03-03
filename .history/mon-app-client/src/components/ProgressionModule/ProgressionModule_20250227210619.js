import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProgressionModule.css';
import CourseModal from '../CourseModal/CourseModal';

const ProgressionModule = ({ userId }) => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProgression = async () => {
      try {
        // On met à jour la progression dans le fichier userProgress.json
        await axios.post(`http://localhost:3001/api/user/${userId}/update-progression`);
        // Puis on récupère les données de progression
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

  // On filtre pour n'afficher que les modules où au moins 1 cours a été validé
  const modulesWithProgress = progressData.modules.filter(module => module.validatedCourses.length > 0);

  const handleConsulterModule = async (moduleId) => {
    try {
      // Récupérer les cours du module via une route dédiée (par exemple, GET /api/modules/:moduleId/courses)
      const response = await axios.get(`http://localhost:3001/api/modules/${moduleId}/courses`);
      setCourses(response.data);
      const selected = modulesWithProgress.find(module => module.moduleId === moduleId);
      setSelectedModule(selected);
      setShowModal(true);
    } catch (error) {
      console.error('Erreur lors de la récupération des cours du module :', error);
    }
  };

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
              <div className="progress-bar" style={{ width: module.progress }}>
                {module.progress}
              </div>
            </div>
            <button onClick={() => handleConsulterModule(module.moduleId)}>
              Consulter module
            </button>
          </div>
        ))
      )}

      {showModal && selectedModule && (
        <CourseModal 
          module={selectedModule}
          courses={courses}
          onClose={() => setShowModal(false)}
          userId={userId}
        />
      )}
    </div>
  );
};

export default ProgressionModule;
