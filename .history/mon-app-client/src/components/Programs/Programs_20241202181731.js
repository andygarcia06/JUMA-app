import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useMembersContext } from '../../contexts/MemberContext'; // Importez le contexte des membres
import DashboardTickets from '../DashboardTickets/DashboardTickets'; // Importez DashboardTickets
import AddProgramPopup from '../AddProgramPopup/AddProgramPopup';

import './style.css';

const Programs = ({ companyId, userId, companyName }) => {
  const [programs, setPrograms] = useState([]);
  const [members, setMembers] = useState([]);
  const { membersData, setMembersData } = useMembersContext();
  const navigate = useNavigate();
  const [selectedProgram, setSelectedProgram] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const responsePrograms = await axios.get(`http://localhost:3001/api/company/${companyId}/programs`);
        setPrograms(responsePrograms.data);
        console.log(responsePrograms.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des programmes :', error);
      }
    };

    const fetchMembers = async () => {
      try {
        const responseMembers = await axios.get(`http://localhost:3001/api/company/${companyId}/members`);
        setMembers(responseMembers.data.members);
      } catch (error) {
        console.error('Erreur lors de la récupération des membres de l\'entreprise :', error);
      }
    };

    fetchPrograms();
    fetchMembers();
  }, [companyId]);

  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
  };

  const handleClickProgramDetail = (program) => {
    const { programId, programName, description, programManager } = program;
    if (programId && programName && description && programManager) {
      navigate(`/program/${programId}`, {
        state: {
          companyName: companyName,
          companyId: companyId,
          userId: userId,
          programId: programId,
          programName: programName,
          programDescription: description,
          programManager: programManager
        }
      });
    } else {
      console.error('Missing program data:', program);
    }
  };

  const handleMembersChange = (updatedMembers) => {
    console.log("Updated members:", updatedMembers);
    setMembers(updatedMembers);
  };

  return (
    <div className="programs-container">
      <h3>Programmes assignés à l'entreprise</h3>
      <div className="programs-list">
        {programs.map(program => (
          <div key={program.id} className="program-item" onClick={() => handleClickProgramDetail(program)}>
            <strong>{program.programName}</strong>: {program.description}
          </div>
        ))}
      </div>


      <AddProgramPopup 
        companyId={companyId} 
        userId={userId} 
        members={members} 
        onMembersChange={handleMembersChange} 
      />
    </div>
  );
}

export default Programs;
