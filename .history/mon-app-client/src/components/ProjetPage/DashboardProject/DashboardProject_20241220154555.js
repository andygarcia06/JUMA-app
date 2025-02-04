import React, { useState } from 'react';
import Metrics from './Metrics/Metrics';
import ProjectTab from './ProjectTab/ProjectTab';
import './DashboardProject.css';

const DashboardProject = ({ companyId, userId, programId, projectId, programName, companyName }) => {
  const [projectTabs, setProjectTabs] = useState([]); // État pour gérer les tabs dynamiques

  const handleAddTab = () => {
    const newTab = {
      id: projectTabs.length + 1,
      name: `Tab ${projectTabs.length + 1}`,
      owner: `User ${userId}`, // Exemple : attribuer l'utilisateur comme propriétaire
    };
    setProjectTabs([...projectTabs, newTab]); // Ajouter une nouvelle tab
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
      
      {/* Bouton pour ajouter une nouvelle tab */}
      <button onClick={handleAddTab} className="add-tab-button">
        + Ajouter une tab
      </button>
      
      {/* Afficher toutes les tabs dynamiques */}
      {projectTabs.map((tab) => (
        <ProjectTab 
          key={tab.id} 
          companyId={companyId} 
          userId={userId} 
          programId={programId} 
          projectId={projectId} 
          programName={programName} 
          companyName={companyName} 
          tabName={tab.name} 
          tabOwner={tab.owner} 
        />
      ))}
    </div>
  );
};

export default DashboardProject;
