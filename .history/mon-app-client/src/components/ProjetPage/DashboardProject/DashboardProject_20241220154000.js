import React from 'react';
import Metrics from './Metrics/Metrics';
import ProjectTab from './ProjectTab/ProjectTab';
import './DashboardProject.css';

const DashboardProject = ({ companyId, userId, programId, projectId, programName, companyName }) => {
  console.log(userId)
  return (
    <div className="dashboard-project">
      <h2>Dashboard : Budget du projet</h2>
      <Metrics />
      <ProjectTab />
    </div>
  );
};

export default DashboardProject; // Exportation par défaut
