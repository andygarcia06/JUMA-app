import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProgressionModule.css';
import CourseModal from '../CourseModal/CourseModal';

const ProgressionModule = ({ userId, user }) => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pour la modal qui affiche la liste des cours du module sélectionné
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleCourses, setModuleCourses] = useState([]);
  const [showModuleModal, setShowModuleModal] = useState(false);
  
  // Pour la modal de détail d'un cours
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);

  useEffect(() => {
    const fetchProgression = async () => {
      try {
        // Met à jour la progression côté backend
        await axios.post(`/api/users/${userId}/update-progression`);
        // Récupère ensuite la progression mise à jour
        const response = await axios.get(`/api/users/${userId}/progression`);
        setProgressData(response.data);
      } catch (err) {
        console.error('Erreur lors de la récupération de la progression :', err);
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

  // Filtrer les modules ayant au moins un cours validé
  const modulesWithProgress = progressData.modules.filter(
    module => module.validatedCourses.length > 0
  );

  // Fonction pour ouvrir la modal du module et afficher ses cours
  const openModuleModal = async (moduleId) => {
    try {
      // Récupérer les cours du module via l'API
      const response = await axios.get(`/api/modules/${moduleId}/courses`);
      setModuleCourses(response.data);
      const mod = modulesWithProgress.find(module => module.moduleId === moduleId);
      setSelectedModule(mod);
      setShowModuleModal(true);
    } catch (error) {
      console.error('Erreur lors de la récupération des cours du module :', error);
    }
  };

  // Fonction pour ouvrir la modal de détail d'un cours
  const openCourseModal = (course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

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
            <button onClick={() => openModuleModal(module.moduleId)}>
              Consulter module
            </button>
          </div>
        ))
      )}

      {/* Modal affichant la liste des cours du module sélectionné */}
      {showModuleModal && selectedModule && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModuleModal(false)}>&times;</span>
            <h3>Cours du module : {selectedModule.moduleName}</h3>
            {moduleCourses.length === 0 ? (
              <p>Aucun cours trouvé pour ce module.</p>
            ) : (
              <ul className="course-multi">
                {moduleCourses.map(course => (
                  <li 
                    className="course-single" 
                    key={course.id} 
                    onClick={() => openCourseModal(course)}
                  >
                    <h4>{course.title}</h4>
                    <p>{course.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Modal de détail d'un cours via CourseModal */}
      {showCourseModal && selectedCourse && (
        <CourseModal 
          course={selectedCourse}
          onClose={() => setShowCourseModal(false)}
          user={user}
          moduleId={selectedModule.moduleId}
        />
      )}
    </div>
  );
};

export default ProgressionModule;
