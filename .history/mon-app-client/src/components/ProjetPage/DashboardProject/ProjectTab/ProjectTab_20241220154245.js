// ProjectTab.js
import React from 'react';

const ProjectTab = ({ companyId, userId, programId, projectId, programName, companyName }) => {
    console.log("Props reçus dans ProjectTab :", { companyId, userId, programId, projectId, programName, companyName });
    return <div>ProjectTab pour {projectId}</div>;
  };
  export default ProjectTab;
  