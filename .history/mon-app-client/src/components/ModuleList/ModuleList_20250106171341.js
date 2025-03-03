import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ModuleList.css';
import CourseModal from '../CourseModal/CourseModal'; // Importez le composant CourseModal


const ModuleList = ({ user }) => {
  const [modules, setModules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/modules');
      setModules(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des modules :', error);
    }
  };

  console.log("Données de l'utilisateur dans ModuleList :", user);


  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setShowModal(true);


  };

  const filterModules = (searchTerm) => {
    return modules.filter(module =>
      module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.courses.some(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };
  

  const handleModuleClick = async (moduleId) => {
    setSelectedModule(null); // Réinitialiser le module sélectionné
    setSelectedCourse(null); // Réinitialiser le cours sélectionné
  
    try {
      const response = await axios.get(`/api/modules/${moduleId}/courses`);
      console.log('Cours chargés :', response.data); // Afficher les cours chargés dans la console
      setCourses(response.data);
      
      // Mettre à jour les modules avec les nouveaux cours chargés
      const updatedModules = modules.map(module => {
        if (module.id === moduleId) {
          return { ...module, courses: response.data };
        }
        return module;
      });
      setModules(updatedModules);
      
      // Mettre à jour le module sélectionné
      setSelectedModule(updatedModules.find(module => module.id === moduleId)); 
    } catch (error) {
      console.error('Erreur lors de la récupération des cours du module :', error);
    }
  };
  

  return (
    <div>
      <h2>Liste des modules</h2>
      <input
        type="text"
        placeholder="Rechercher un module par nom..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <ul className='module-multi'>
        {filterModules(searchTerm).map(module => (
          <li className='module-single' key={module.id} onClick={() => handleModuleClick(module.id)}>
            {module.title}
          </li>
        ))}
      </ul>

      {/* Modal pour afficher les cours du module sélectionné */}
      {selectedModule && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setSelectedModule(null)}>&times;</span>
            <h3>Cours du module : {selectedModule.title}</h3>
            <ul>
              {courses.map(course => (
                <li key={course.id} onClick={() => handleCourseClick(course)}>
                  <h4>{course.title}</h4>
                  <p>{course.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
      )}

      {/* Modal pour afficher les détails du cours sélectionné */}
      {showModal && <CourseModal module={selectedModule} course={selectedCourse} onClose={() => setShowModal(false)} user={user} moduleId={selectedModule.id}/>}
      
    </div>
  );
};

export default ModuleList;
