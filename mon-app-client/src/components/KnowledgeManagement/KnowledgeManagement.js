import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import NewKnowledgeItem from '../NewKnowledgeItem/NewKnowledgeItem';
import ModuleList from '../ModuleList/ModuleList'; // Import du composant ModuleList

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
      const response = await axios.get('http://localhost:3001/api/modules');
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
      const response = await axios.post('http://localhost:3001/api/modules', newModule);
      setModules([...modules, response.data]); // Utilisation de setModules pour mettre à jour l'état des modules
      setShowPopup(false);
    } catch (error) {
      console.error('Erreur lors de la création d\'un nouveau module :', error);
    }
  };

// Fonction pour ajouter un nouveau cours
const addNewCourse = async (newCourse, user) => {
    try {
      // Ajouter l'utilisateur en tant que créateur du nouveau cours
      newCourse.creator = user;
      const response = await axios.post('http://localhost:3001/api/courses', newCourse);
  
      // Trouver le module correspondant dans la liste des modules
      const updatedModules = modules.map(module => {
        if (module.id === newCourse.moduleId) {
          // Ajouter le nouveau cours au module correspondant
          return {
            ...module,
            courses: [...module.courses, response.data] // Ajouter le nouveau cours au tableau des cours du module
          };
        }
        return module;
      });
  
      // Mettre à jour l'état des modules avec le nouveau cours ajouté
      setModules(updatedModules);
      
      // Traiter la réponse et effectuer d'autres actions si nécessaire
    } catch (error) {
      console.error('Erreur lors de la création d\'un nouveau cours :', error);
    }
  };
  

  return (
    <div>
      <h1>Gestion des Connaissances</h1>
      <input
        type="text"
        placeholder="Rechercher un module..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <ModuleList modules={modules} user={user} />
      <button onClick={() => setShowPopup(true)}>Ajouter un nouveau</button>
      {showPopup && (
        <NewKnowledgeItem
          onClose={() => setShowPopup(false)}
          onNewModule={(newModule) => addNewModule(newModule, user)}
          onNewCourse={(newCourse) => addNewCourse(newCourse, user)}
          modules={modules}
        />
      )}
    </div>
  );
};

export default KnowledgeManagement;
