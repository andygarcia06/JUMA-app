import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation,useNavigate } from 'react-router-dom';
import { useMembersContext } from '../../../contexts/MemberContext'; // Importez le contexte des membres
import AddProjectPopup from '../AddProjectPopup/AddProjectPopup'; // Importez la popup pour ajouter un projet
import '../style.css'

const ProgramDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { membersData } = useMembersContext(); // Accéder au contexte des membres
  const [companyMembers, setCompanyMembers] = useState([]);
  const [programProjects, setProgramProjects] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [programParticipants, setProgramParticipants] = useState([]);

  const { companyId, userId, programId, programName, programDescription, programManager } = location.state;

  // États locaux pour les champs du formulaire d'ajout de projet
  const [newProjectName, setNewProjectName] = useState('');
  const [projectParticipants, setProjectParticipants] = useState([]);
  const [projectStartDate, setProjectStartDate] = useState('');
  const [projectEndDate, setProjectEndDate] = useState('');

  const fetchData = async () => {
    try {
      // Récupérer les membres de l'entreprise
      const membersResponse = await axios.get(`/api/company/${companyId}/members`);
      setCompanyMembers(membersResponse.data.members);

      // Récupérer les projets du programme
      const projectsResponse = await axios.get(`/api/company/${companyId}/programs/${programId}/projects`);
      setProgramProjects(projectsResponse.data);
  

      // Récupérer les programmes de l'entreprise
      const programsResponse = await axios.get(`/api/company/${companyId}/programs`);
      const programsData = programsResponse.data;

            // Pour chaque programme, récupérer les participants
            for (const program of programsData) {
              console.log(programId)
              const participantsResponse = await axios.get(`/api/company/${companyId}/program/${programId}/participants`);
              const participants = participantsResponse.data;
              setProgramParticipants(participantsResponse.data);

        
              // Ajouter les participants au programme
              program.participants = participants;
            }


      setPrograms(programsData);
    } catch (error) {
      console.error('Erreur lors de la récupération des données :', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId, programId]);

  const handleClickProject = (projectId,companyId,programId) => {
    navigate(`/projet/${projectId}`);
  };



  return (
    <div>
      {/* Afficher les détails du programme */}
      <h2>{programName}</h2>
      <p>Description: {programDescription}</p>
      <p>Responsable du programme: {programManager}</p>

      {/* Afficher la liste des membres */}
      <h3>Membres du programme :</h3>


      {/* Afficher la liste des membres de l'entreprise */}
      <ul>
        {programParticipants.map(member => (
          <li key={member.userId}>{member.email}</li>
        ))}
      </ul>


      <h3>Projets du programme :</h3>
      <ul>
        {programProjects && programProjects.map(project => (
          <li className='project-item' key={project.id} onClick={() => handleClickProject(project.id)}>
            {project.projectName}
            <div>Nom du projet: {project.projectName}</div>
            <div>Date de début: {project.startDate}</div>
            <div>Date de fin: {project.endDate}</div>
            <div>Participants: {project.participants.join(', ')}</div>
          </li>
        ))}
      </ul>
      {/* Ajouter un projet */}

      {/* Formulaire pour ajouter un projet */}
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
        programParticipants={programParticipants} // Passer programParticipants ici

      />
    </div>
  );
};

export default ProgramDetails;
