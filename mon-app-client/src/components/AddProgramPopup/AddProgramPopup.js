import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddProgramPopup = ({ companyId, userId, members,onMembersChange }) => {
  const [programs, setPrograms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramDescription, setNewProgramDescription] = useState('');
  const [programManager, setProgramManager] = useState('');
  const [participants, setParticipants] = useState('');
  const [otherInfo, setOtherInfo] = useState('');

  const handleMembersChange = (updatedMembers) => {
    // Appeler la fonction de rappel pour faire remonter les membres
    onMembersChange(updatedMembers);
  };

  useEffect(() => {
    const filtered = programs.filter(program =>
      program.programName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPrograms(filtered);
  }, [programs, searchQuery]);



  const handleAddProgram = async () => {
    try {
      // Vérifier si le responsable du programme est déjà membre de l'entreprise actuelle
      const isManagerMember = members.some(member => member.userId === programManager);
      if (!isManagerMember) {
        console.error(`Le responsable du programme ${programManager} n'est pas membre de l'entreprise actuelle.`);
        return;
      }

      // Obtenir les membres sélectionnés pour le programme
      const selectedParticipants = members.filter(member => participants.includes(member.userId));
      
      // Effectuer la requête pour ajouter le programme
      await axios.post(`http://localhost:3001/api/company/${companyId}/programs`, {
        programName: newProgramName,
        description: newProgramDescription,
        programManager: programManager,
        participants: selectedParticipants,
        otherInfo: otherInfo
      });
      console.log(`Programme ${newProgramName} ajouté à l'entreprise ${companyId}`);
      // Effacer les champs du formulaire après l'ajout
      setNewProgramName('');
      setNewProgramDescription('');
      setProgramManager('');
      setParticipants([]);
      setOtherInfo('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du programme à l\'entreprise :', error);
    }

  
  };
  

  return (
    <div className="add-program-popup">
       {/* Formulaire d'ajout de programme */}
       <h3>Ajouter un nouveau programme</h3>
      <input
        type="text"
        placeholder="Nom du programme"
        value={newProgramName}
        onChange={e => setNewProgramName(e.target.value)}
      />
      <textarea
        placeholder="Description du programme"
        value={newProgramDescription}
        onChange={e => setNewProgramDescription(e.target.value)}
      ></textarea>
      <div>
        <label htmlFor="programManager">Responsable du programme:</label>
        <select id="programManager" value={programManager} onChange={e => setProgramManager(e.target.value)}>
          <option value="">Sélectionnez un responsable</option>
          {members.map(member => (
            <option key={member.userId} value={member.userId}>{member.email}</option>
          ))}
        </select>
      </div>
      <div>
      <label>Participants au programme:</label>
  {members.map(member => (
    <div key={member.userId}>
      <input
        type="checkbox"
        id={member.userId}
        value={member.userId}
        checked={participants.includes(member.userId)}
        onChange={e => {
          const isChecked = e.target.checked;
          if (isChecked) {
            setParticipants([...participants, member.userId]);
          } else {
            setParticipants(participants.filter(id => id !== member.userId));
          }
        }}
      />
      <label htmlFor={member.userId}>{member.email}</label>
    </div>
  ))}
</div>
      <textarea
        placeholder="Autres informations (optionnel)"
        value={otherInfo}
        onChange={e => setOtherInfo(e.target.value)}
      ></textarea>
      <button onClick={handleAddProgram}>Ajouter</button>
    </div>
  );
};

export default AddProgramPopup;
