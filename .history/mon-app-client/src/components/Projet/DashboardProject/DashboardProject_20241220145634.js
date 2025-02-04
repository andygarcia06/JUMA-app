import React from 'react';
import Metrics from './Metrics/Metrics'; // Import du composant Metrics
import ProjectTab from './ProjectTab/ProjectTab'; // Import du composant ProjectTab
import './DashboardProject.css';

const DashboardProject = () => {
  return (
    <div className="dashboard-project">
    <h1>Dashboard : Budget du projet</h1>
      {/* Composant Metrics */}
      <Metrics />

      {/* Composant ProjectTab */}
      <ProjectTab />
    </div>
  );
};

export default DashboardProject;
