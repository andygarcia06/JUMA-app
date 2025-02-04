import React, { useState, useEffect } from 'react';
import Metrics from './Metrics/Metrics';
import ProjectTab from './ProjectTab/ProjectTab';
import './DashboardProject.css';
import axios from 'axios'; // Import Axios pour les requêtes HTTP

const DashboardProject = ({ companyId, userId, programId, projectId, programName, companyName }) => {
  const [projectTabs, setProjectTabs] = useState([]); // État pour les tabs
  const [showPopup, setShowPopup] = useState(false); // État pour gérer la popup
  const [newTabName, setNewTabName] = useState(''); // État pour stocker le nom de la tab

  // Charger les tabs existants depuis le JSON (back-end)
  useEffect(() => {
    const fetchTabs = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/projects/${projectId}/tabs`); // Endpoint pour récupérer les tabs
        setProjectTabs(response.data.tabs); // Mettre à jour l'état avec les tabs récupérés
      } catch (error) {
        console.error("Erreur lors de la récupération des tabs :", error);
      }
    };

    fetchTabs(); // Appeler la fonction au montage du composant
  }, [projectId]);

  // Ouvrir/Fermer la popup
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  // Enregistrer la nouvelle tab côté back-end
  const saveNewTab = async (tab) => {
    try {
      const response = await axios.post(`http://localhost:3001/projects/${projectId}/tabs`, {
        companyId,
        programId,
        projectId,
        tabId: tab.id,
        tabName: tab.name,
      });
      return response.data; // Retourner la réponse du serveur
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tab :", error);
      throw error;
    }
  };

  // Ajouter une nouvelle tab
  const handleAddTab = async () => {
    if (newTabName.trim() !== '') {
      const newTab = {
        id: projectTabs.length + 1,
        name: newTabName,
      };

      try {
        // Enregistrer la nouvelle tab côté back-end
        await saveNewTab(newTab);

        // Ajouter localement si la sauvegarde est réussie
        setProjectTabs([...projectTabs, newTab]);
        setNewTabName(''); // Réinitialiser le nom
        togglePopup(); // Fermer la popup
      } catch (error) {
        console.error("Erreur lors de l'ajout de la tab :", error);
      }
    }
  };

  return (
    <div className="dashboard-project">
      <h2>Dashboard : Budget du projet</h2>
      
      <Metrics 
        companyId={companyId} 
        userId={userId} 
        programId={programId} 
        projectId={projectId} 
        programName={programName} 
        companyName={companyName} 
      />
      
      {/* Bouton pour ouvrir la popup */}
      <button onClick={togglePopup} className="add-tab-button">
        + Ajouter une tab
      </button>
      
      {/* Afficher toutes les tabs */}
      {projectTabs.map((tab) => (
        <ProjectTab 
          key={tab.id} 
          tabName={tab.name} 
          companyId={companyId} 
          userId={userId} 
          programId={programId} 
          projectId={projectId} 
          programName={programName} 
          companyName={companyName} 
        />
      ))}

      {/* Popup */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Créer une nouvelle tab</h3>
            <input
              type="text"
              placeholder="Nom de la tab"
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
            />
            <div className="popup-buttons">
              <button onClick={handleAddTab}>Créer</button>
              <button onClick={togglePopup}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardProject;
