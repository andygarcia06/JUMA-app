import React from 'react';
import Metrics from './Metrics/Metrics';
import ProjectTab from './ProjectTab/ProjectTab';
import './DashboardProject.css';

const DashboardProject = ({ companyId, userId, programId, projectId, programName, companyName }) => {
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
      <ProjectTab 
        companyId={companyId} 
        userId={userId} 
        programId={programId} 
        projectId={projectId} 
        programName={programName} 
        companyName={companyName} 
      />    
        
      </div>
  );
};

export default DashboardProject; // Exportation par défaut
