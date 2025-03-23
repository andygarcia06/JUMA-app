import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CourseModal from '../CourseModal/CourseModal';
import './MostViewedModulesByCompany.css';

const MostViewedModulesByCompany = ({ user }) => {
  const [mostViewedModules, setMostViewedModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);

  useEffect(() => {
    const fetchMostViewedModules = async () => {
      try {
        // On utilise le pseudo (user.pseudo) pour l'identifiant
        const validUserId = user.pseudo;
        console.log('[FRONT] Appel à /api/user/', validUserId, '/most-viewed-modules');
        const response = await axios.get(`/api/user/${validUserId}/most-viewed-modules`);
        console.log('[FRONT] Modules les plus consultés récupérés:', response.data);
        if (Array.isArray(response.data)) {
          // Ne garder que les trois premiers modules (les plus populaires)
          setMostViewedModules(response.data.slice(0, 3));
        } else {
          console.error('[FRONT] Données reçues invalides:', response.data);
          setMostViewedModules([]);
        }
      } catch (error) {
        console.error('[FRONT] Erreur lors de la récupération des modules :', error);
        setError('Impossible de charger les modules.');
      } finally {
        setLoading(false);
      }
    };

    fetchMostViewedModules();
  }, [user.pseudo]);

  const handleModuleClick = async (moduleId) => {
    setSelectedModule(null);
    setSelectedCourse(null);
    setShowModuleModal(false);
    setShowCourseModal(false);

    try {
      console.log('[FRONT] Récupération des cours pour module:', moduleId);
      const response = await axios.get(`/api/modules/${moduleId}/courses`);
      console.log('[FRONT] Cours récupérés pour module', moduleId, response.data);
      const mod = mostViewedModules.find(module => module.id === moduleId);
      if (mod) {
        setSelectedModule({ ...mod, courses: response.data });
        setCourses(response.data);
        setShowModuleModal(true);
      }
    } catch (error) {
      console.error('[FRONT] Erreur lors de la récupération des cours du module :', error);
    }
  };

  const handleCourseClick = (course) => {
    if (course) {
      setSelectedCourse(course);
      setShowCourseModal(true);
    }
  };

  if (loading) {
    return <p>Chargement des modules les plus populaires...</p>;
  }
  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div className="most-viewed-modules">
      <h2>📊 Modules les plus populaires dans votre entreprise</h2>
      <div className="module-cards">
        {mostViewedModules.length > 0 ? (
          mostViewedModules.map(module => (
            <div key={module.id} className="module-card" onClick={() => handleModuleClick(module.id)}>
              <h3>{module.title}</h3>
              <p>{module.courses ? module.courses.length : 0} cours</p>
              <p>Réactions : {module.reactions ? module.reactions : 0}</p>
            </div>
          ))
        ) : (
          <p>Aucun module avec des interactions de vos collègues.</p>
        )}
      </div>

      {/* Modal affichant la liste des cours du module sélectionné */}
      {showModuleModal && selectedModule && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModuleModal(false)}>&times;</span>
            <h3>Cours du module : {selectedModule.title}</h3>
            <ul className="course-list">
              {courses.length === 0 ? (
                <p>Aucun cours trouvé pour ce module.</p>
              ) : (
                courses.map(course => (
                  <li className="course-item" key={course.id} onClick={() => handleCourseClick(course)}>
                    <h4>{course.title}</h4>
                    <p>{course.description}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Modal de détail d'un cours via CourseModal */}
      {showCourseModal && selectedModule && selectedCourse && user && (
        <CourseModal 
          module={selectedModule} 
          course={selectedCourse} 
          onClose={() => {
            setShowCourseModal(false);
            setSelectedCourse(null);
          }} 
          user={user} 
          moduleId={selectedModule.id} 
        />
      )}
    </div>
  );
};

export default MostViewedModulesByCompany;
