import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ModuleList.css'; // Votre fichier CSS pour le style
import CourseModal from '../CourseModal/CourseModal';

const ProgressionModule = ({ user }) => {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    try {
      // On utilise la route GET pour récupérer la progression de l'utilisateur
      const response = await axios.get(`http://localhost:3001/api/user/${user.userId}/progression`);
      // On ne conserve que les modules où la progression est > 0%
      const progressedModules = response.data.modules.filter(module => parseFloat(module.progress) > 0);
      setModules(progressedModules);
    } catch (error) {
      console.error('Erreur lors de la récupération de la progression :', error);
    }
  };

  const handleConsulterModule = async (moduleId) => {
    try {
      // Récupération des cours du module (par exemple via GET /api/modules/:moduleId/courses)
      const response = await axios.get(`http://localhost:3001/api/modules/${moduleId}/courses`);
      setCourses(response.data);
      const selected = modules.find(module => module.moduleId === moduleId);
      setSelectedModule(selected);
      setShowModal(true);
    } catch (error) {
      console.error('Erreur lors de la récupération des cours du module :', error);
    }
  };

  return (
    <div className="progression-module">
      <h2>Ma progression</h2>
      {modules.length === 0 && <p>Aucun module en cours de progression.</p>}
      <div className="modules-container">
        {modules.map(module => (
          <div className="module-progress" key={module.moduleId}>
            <h3>{module.moduleName}</h3>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: module.progress }}>
                {module.progress}
              </div>
            </div>
            <p>{module.validatedCourses.length} / {module.totalCourses} cours validés</p>
            <button onClick={() => handleConsulterModule(module.moduleId)}>Consulter module</button>
          </div>
        ))}
      </div>

      {showModal && selectedModule && (
        <CourseModal
          module={selectedModule}
          courses={courses}
          onClose={() => setShowModal(false)}
          user={user}
          moduleId={selectedModule.moduleId}
        />
      )}
    </div>
  );
};

export default ProgressionModule;
