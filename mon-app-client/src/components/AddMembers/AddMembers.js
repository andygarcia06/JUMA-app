import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddMembersPopup = ({ companyId }) => {
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/users`);
        setMembers(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des membres :', error);
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    const filtered = members.filter(member =>
      member.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMembers(filtered);
  }, [members, searchQuery]);
  

  const handleAddMember = async (userId, email) => {
    // Vérifier si l'utilisateur actuel est le propriétaire de l'entreprise
    if (userId !== userId) {
      console.error('Vous n\'êtes pas autorisé à ajouter un membre à cette entreprise.');
      return;
    }

    try {
      await axios.post(`http://localhost:3001/api/company/${companyId}/members`, {
        userId,
        email
      });
      console.log(`Membre ${userId} ajouté à l'entreprise ${companyId}`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre à l\'entreprise :', error);
    }
  };

  console.log(members)

  return (
    <div className="add-members-popup">
      <input
        type="text"
        placeholder="Rechercher un membre par e-mail ou nom"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
      <ul>
        {filteredMembers.map(member => (
          <li key={member.userId}>
            <span>{member.userId} </span>
            <span>{member.email}</span>
            <button onClick={() => handleAddMember(member.userId, member.email)}>Ajouter</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddMembersPopup;
