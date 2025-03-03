import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProgressionModule.css';
import CourseModal from '../CourseModal/CourseModal';

const ProgressionModule = ({ userId, user }) => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProgression = async () => {
      try {
        // Met à jour la progression dans userProgress.json
        await axios.post(`http://localhost:3001/api/user/${userId}/update-progression`);
        // Récupère ensuite la progression mise à jour
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

  // Handler pour ouvrir la modal et afficher un cours du module
  const handleConsultModule = async (moduleId) => {
    try {
      // Récupérer les cours du module via l'API (ex: GET /api/modules/:moduleId/courses)
      const response = await axios.get(`http://localhost:3001/api/modules/${moduleId}/courses`);
      const courseList = response.data;
      if (courseList.length > 0) {
        // On choisit ici le premier cours à afficher dans la modale
        setSelectedCourse(courseList[0]);
        // Trouver le module sélectionné dans les données de progression
        const selected = progressData.modules.find(m => m.moduleId === moduleId);
        setSelectedModule(selected);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des cours du module :', error);
    }
  };

  if (loading) return <p>Chargement de la progression...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!progressData) return <p>Aucune donnée de progression disponible.</p>;

  // Filtrer pour n'afficher que les modules où au moins un cours a été validé
  const modulesWithProgress = progressData.modules.filter(module => module.validatedCourses.length > 0);

  return (
    <div className="progression-module">
      <h2>📈 Progression de {progressData.username}</h2>
      <p>Entreprise : {progressData.company}</p>
      <h3>Modules suivis :</h3>
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
            <button onClick={() => handleConsultModule(module.moduleId)}>
              Consulter module
            </button>
          </div>
        ))
      )}

      {showModal && selectedModule && selectedCourse && (
        <CourseModal 
          course={selectedCourse}
          onClose={() => setShowModal(false)}
          user={user}
          moduleId={selectedModule.moduleId}
        />
      )}
    </div>
  );
};

export default ProgressionModule;
