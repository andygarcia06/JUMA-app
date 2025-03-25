import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import NewKnowledgeItem from '../NewKnowledgeItem/NewKnowledgeItem';
import ModuleList from '../ModuleList/ModuleList'; 
import MostViewedModulesByCompany from '../MostViewedModulesByCompany/MostViewedModulesByCompany';
import ProgressionModule from '../ProgressionModule/ProgressionModule';
import BackButton from '../BackButton/BackButton';

import "./style/style.css";

const KnowledgeManagement = () => {
  const location = useLocation();
  const { user } = location.state || {};
  const [modules, setModules] = useState([]); // Utilisation de useState pour définir modules et setModules
  const [searchTerm, setSearchTerm] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  console.log("Données de l'utilisateur dans KEM:", user);

  // Charger les modules depuis le serveur lors du montage du composant
  useEffect(() => {
    fetchModules();
  }, []);

  // Fonction pour charger les modules depuis le serveur
  const fetchModules = async () => {
    try {
      const response = await axios.get('/api/modules');
      if (response.data && Array.isArray(response.data)) {
        setModules(response.data); // Utilisation de setModules pour mettre à jour l'état des modules
      } else {
        console.error('La réponse de l\'API ne contient pas de modules valides :', response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des modules :', error);
    }
  };

  // Fonction pour ajouter un nouveau module
  const addNewModule = async (newModule, user) => {
    try {
      // Ajouter l'utilisateur en tant que créateur du nouveau module
      newModule.creator = user;
      const response = await axios.post('/api/modules', newModule);
      setModules([...modules, response.data]); // Utilisation de setModules pour mettre à jour l'état des modules
      setShowPopup(false);
    } catch (error) {
      console.error('Erreur lors de la création d\'un nouveau module :', error);
    }
  };

// Fonction pour ajouter un nouveau cours
const addNewCourse = async (newCourse, user) => {
  try {
    // On ajoute l'utilisateur en tant que créateur du cours
    newCourse.creator = user;
    const response = await axios.post('/api/courses', newCourse);

    // Mise à jour de l'état : on ajoute le nouveau cours au module correspondant
    const updatedModules = modules.map(module => {
      if (module.id === newCourse.moduleId) {
        return {
          ...module,
          courses: [...module.courses, response.data]
        };
      }
      return module;
    });

    setModules(updatedModules);
  } catch (error) {
    console.error('Erreur lors de la création d\'un nouveau cours :', error);
  }
};

  

  return (
    <div className='dashboard-knowledge'>
     <BackButton />
      <div className='left-section'>
      <button onClick={() => setShowPopup(true)}>Ajouter un nouveau</button>
      {showPopup && (
        <NewKnowledgeItem
          className="modal-new-item"
          onClose={() => setShowPopup(false)}
          onNewModule={(newModule) => addNewModule(newModule, user)}
          onNewCourse={(newCourse) => addNewCourse(newCourse, user)}
          modules={modules}
        />
      )}
      </div>
      <div className='right-section'>
      <h1>Micro Learning</h1>
      <ProgressionModule userId={user.pseudo} user={user} />

            {/* Afficher uniquement si `user` est défini */}
            {user && user.userId && (
              <MostViewedModulesByCompany user={user} userId={user.pseudo} />
            )}
      <ModuleList modules={modules} user={user} className="module-list"/>


    </div>
    </div>
  );
};

export default KnowledgeManagement;
