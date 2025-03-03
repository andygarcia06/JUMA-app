import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CourseModal from '../CourseModal/CourseModal';
import './MostViewedModulesByCompany.css';

const MostViewedModulesByCompany = ({ user, userId }) => {
  const [mostViewedModules, setMostViewedModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false); // Pour gérer l'affichage de CourseModal

  useEffect(() => {
    const fetchMostViewedModules = async () => {
      try {
        // Assurez-vous que la route "/api/user/${userId}/most-viewed-modules" existe bien sur le backend
        const response = await axios.get(`/api/user/${userId}/most-viewed-modules`);
        
        // On s'attend à recevoir un tableau en JSON
        if (Array.isArray(response.data)) {
          setMostViewedModules(response.data);
        } else {
          console.error("Données reçues invalides :", response.data);
          setMostViewedModules([]);
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

  const handleModuleClick = async (moduleId) => {
    // Réinitialiser les états de sélection
    setSelectedModule(null);
    setSelectedCourse(null);
    setShowModuleModal(false);
    setShowCourseModal(false);

    try {
      // Récupérer la liste des cours du module via une route dédiée
      const response = await axios.get(`/api/modules/${moduleId}/courses`);
      // Trouver le module dans la liste des modules les plus consultés
      const module = mostViewedModules.find(module => module.id === moduleId);
      if (module) {
        // On enrichit l'objet module avec la liste des cours
        setSelectedModule({ ...module, courses: response.data });
        setCourses(response.data);
        setShowModuleModal(true);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des cours du module :', error);
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
      <ul>
        {mostViewedModules.length > 0 ? (
          mostViewedModules.map(module => (
            <li key={module.id} onClick={() => handleModuleClick(module.id)} className="module-item">
              <h3>{module.title}</h3>
              <p>{module.courses ? module.courses.length : 0} cours - Réactions : {module.reactions ? module.reactions.length : 0}</p>
            </li>
          ))
        ) : (
          <p>Aucun module avec des interactions de vos collègues.</p>
        )}
      </ul>

      {/* Modal affichant la liste des cours du module sélectionné */}
      {showModuleModal && selectedModule && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModuleModal(false)}>&times;</span>
            <h3>Cours du module : {selectedModule.title}</h3>
            <ul className='course-list'>
              {courses.length === 0 ? (
                <p>Aucun cours trouvé pour ce module.</p>
              ) : (
                courses.map(course => (
                  <li className='course-item' key={course.id} onClick={() => handleCourseClick(course)}>
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
