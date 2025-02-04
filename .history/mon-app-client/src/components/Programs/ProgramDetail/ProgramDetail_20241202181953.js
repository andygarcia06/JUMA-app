import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMembersContext } from '../../../contexts/MemberContext'; // Importez le contexte des membres
import AddProjectPopup from '../AddProjectPopup/AddProjectPopup'; // Importez la popup pour ajouter un projet
import DashboardTickets from '../../DashboardTickets/DashboardTickets'; // Importez DashboardTickets
import '../style.css';

const ProgramDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { membersData } = useMembersContext(); // Accéder au contexte des membres
  const [companyMembers, setCompanyMembers] = useState([]);
  const [programProjects, setProgramProjects] = useState([]);
  const [programParticipants, setProgramParticipants] = useState([]);

  const { companyId, userId, programId, programName, programDescription, programManager, companyName } = location.state;

  const [newProjectName, setNewProjectName] = useState('');
  const [projectParticipants, setProjectParticipants] = useState([]);
  const [projectStartDate, setProjectStartDate] = useState('');
  const [projectEndDate, setProjectEndDate] = useState('');

  const fetchData = async () => {
    try {
      // Récupérer les membres de l'entreprise
      const membersResponse = await axios.get(`http://localhost:3001/api/company/${companyId}/members`);
      setCompanyMembers(membersResponse.data.members);

      // Récupérer les projets du programme
      const projectsResponse = await axios.get(`http://localhost:3001/api/company/${companyId}/programs/${programId}/projects`);
      setProgramProjects(projectsResponse.data);

      // Récupérer les participants du programme
      const participantsResponse = await axios.get(`http://localhost:3001/api/company/${companyId}/program/${programId}/participants`);
      setProgramParticipants(participantsResponse.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId, programId]);

  const handleClickProject = (projectId) => {
    navigate(`/projet/${projectId}`, {
      state: { companyId, userId, programId, projectId }
    });
  };

  return (
    <div className="program-details-container">
      {/* Afficher les détails du programme */}
      <h2>{programName}</h2>
      <p>Description: {programDescription}</p>
      <p>Responsable du programme: {programManager}</p>

      {/* Ajouter DashboardTickets */}


      {/* Afficher la liste des membres */}
      <h3>Membres du programme :</h3>
      <ul>
        {programParticipants.map(member => (
          <li key={member.userId}>{member.email}</li>
        ))}
      </ul>

      {/* Afficher la liste des projets */}
      <h3>Projets du programme :</h3>
      <ul>
        {programProjects && programProjects.map(project => (
          <li className='project-item' key={project.id} onClick={() => handleClickProject(project.id)}>
            <div>Nom du projet: {project.projectName}</div>
            <div>Date de début: {project.startDate}</div>
            <div>Date de fin: {project.endDate}</div>
            <div>Participants: {project.participants.join(', ')}</div>
          </li>
        ))}
      </ul>

      {/* Ajouter un projet */}
      <AddProjectPopup
        newProjectName={newProjectName}
        setNewProjectName={setNewProjectName}
        projectParticipants={projectParticipants}
        setProjectParticipants={setProjectParticipants}
        projectStartDate={projectStartDate}
        setProjectStartDate={setProjectStartDate}
        projectEndDate={projectEndDate}
        setProjectEndDate={setProjectEndDate}
        companyMembers={companyMembers}
        programId={programId}
        companyId={companyId}
        programParticipants={programParticipants}
      />

      <DashboardTickets 
         companyId={companyId} 
         companyName={companyName} 
        user={{ userId }} 
        programId={programId} 
      /> 
    </div>
  );
};

export default ProgramDetails;
