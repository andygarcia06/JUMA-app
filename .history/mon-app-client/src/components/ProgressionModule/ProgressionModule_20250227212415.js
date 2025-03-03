import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProgressionModule.css';
import CourseModal from '../CourseModal/CourseModal';

const ProgressionModule = ({ userId, user }) => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Pour la popup listant les cours du module sélectionné
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleCourses, setModuleCourses] = useState([]);
  const [showModuleModal, setShowModuleModal] = useState(false);
  // Pour la modal de détail d'un cours
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);

  useEffect(() => {
    const fetchProgression = async () => {
      try {
        // Met à jour la progression dans userProgress.json
        await axios.post(`http://localhost:3001/api/user/${userId}/update-progression`);
        // Puis récupère la progression mise à jour
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

  // On ne montre que les modules ayant au moins un cours validé
  const modulesWithProgress = progressData.modules.filter(module => module.validatedCourses.length > 0);

  // Ouvrir la modal du module pour afficher la liste des cours
  const openModuleModal = async (moduleId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/modules/${moduleId}/courses`);
      const coursesList = response.data;
      setModuleCourses(coursesList);
      const mod = modulesWithProgress.find(module => module.moduleId === moduleId);
      setSelectedModule(mod);
      setShowModuleModal(true);
    } catch (error) {
      console.error('Erreur lors de la récupération des cours du module :', error);
    }
  };

  // Ouvrir la modal de détail d'un cours
  const openCourseModal = (course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
  };

  return (
    <div className="progression-module">
      <h2>📈 Progression de {progressData.username}</h2>
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

      {/* Modal pour afficher la liste des cours du module sélectionné */}
      {showModuleModal && selectedModule && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModuleModal(false)}>&times;</span>
            <h3>Cours du module : {selectedModule.moduleName}</h3>
            <ul className="course-multi">
              {moduleCourses.length === 0 ? (
                <p>Aucun cours trouvé pour ce module.</p>
              ) : (
                moduleCourses.map(course => (
                  <li 
                    className="course-single" 
                    key={course.id} 
                    onClick={() => openCourseModal(course)}
                  >
                    <h4>{course.title}</h4>
                    <p>{course.description}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Modal de détail d'un cours */}
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
