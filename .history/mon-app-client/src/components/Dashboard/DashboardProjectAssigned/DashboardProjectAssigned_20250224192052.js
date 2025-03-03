import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DashboardProjectAssigned({ user }) {
  const [assignedProjects, setAssignedProjects] = useState([]);

  useEffect(() => {
    if (!user || !user.userId) return;
  
    axios.get(`/api/dashboard-project-assigned/${user.userId}`)
      .then(response => {
        setAssignedProjects(response.data.assignedProjects || []);
      })
      .catch(error => {
        console.error('Erreur fetch project-assigned :', error);
      });
  }, [user]);

  return (
    <div>
      <h3>Projets sur lesquels je suis membre</h3>
      {assignedProjects.length === 0 ? (
        <p>Aucun projet assigné trouvé.</p>
      ) : (
        <ul>
          {assignedProjects.map(proj => (
            <li key={proj.projectId}>
              <strong>{proj.projectName}</strong> 
              {` (Company: ${proj.companyName}, Program: ${proj.programName})`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DashboardProjectAssigned;
