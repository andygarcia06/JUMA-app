import React, { useState } from 'react';
import Metrics from './Metrics/Metrics';
import ProjectTab from './ProjectTab/ProjectTab';
import './DashboardProject.css';

const DashboardProject = ({ companyId, userId, programId, projectId, programName, companyName }) => {
  const [projectTabs, setProjectTabs] = useState([]); // État pour les tabs
  const [showPopup, setShowPopup] = useState(false); // État pour gérer la popup
  const [newTabName, setNewTabName] = useState(''); // État pour stocker le nom de la tab

  // Ouvrir/Fermer la popup
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  // Ajouter une nouvelle tab
  const handleAddTab = () => {
    if (newTabName.trim() !== '') {
      const newTab = {
        id: projectTabs.length + 1,
        name: newTabName,
      };
      setProjectTabs([...projectTabs, newTab]); // Ajouter la tab
      setNewTabName(''); // Réinitialiser le nom
      togglePopup(); // Fermer la popup
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
