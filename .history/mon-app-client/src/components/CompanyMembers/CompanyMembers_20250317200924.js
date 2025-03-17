import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddMembersPopup from '../AddMembers/AddMembers';

const CompanyMembers = ({ companyId, userId }) => {
  const [userOwner, setUserOwner] = useState(null);
  const [members, setMembers] = useState([]); 
  const [showAddMemberPopup, setShowAddMemberPopup] = useState(false); 

  useEffect(() => {
    // 🔍 Récupérer les membres
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`/api/company/${companyId}/members`);
        setMembers(response.data.members);
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des membres :', error);
      }
    };

    fetchMembers();
  }, [companyId]);

  useEffect(() => {
    // 🔍 Récupérer le `userId` du créateur depuis `/api/pending-companies`
    const fetchUserOwner = async () => {
      try {
        const response = await axios.get('/api/pending-companies');
        const company = response.data.find(item => item.id === companyId);

        if (company) {
          setUserOwner(company.userId); // 🆔 Met à jour le propriétaire
          console.log(`✅ Créateur trouvé : ${company.userId} pour ${company.companyName}`);
        } else {
          console.error("⚠️ CompanyId non trouvé dans `pending-companies`.");
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération du créateur :', error);
      }
    };

    fetchUserOwner();
  }, [companyId]);

  console.log("🔍 User Owner (Créateur) :", userOwner);
  console.log("🔍 User Actuel :", userId);

  // 🛠 Vérifier si l'utilisateur actuel est le créateur
  const isOwner = String(userId).trim() === String(userOwner).trim();

  return (
    <div>
      <h3>Membres de l'entreprise</h3>
      <ul>
        {members.length > 0 ? (
          members.map(member => <li key={member.userId}>{member.email}</li>)
        ) : (
          <p>Aucun membre trouvé.</p>
        )}
      </ul>

      {/* Affichage du bouton uniquement pour le créateur */}
      {isOwner && (
        <button onClick={() => setShowAddMemberPopup(true)}>Ajouter un membre</button>
      )}

      {/* Popup d'ajout de membre */}
      {showAddMemberPopup && isOwner && (
        <div className="add-member-popup">
          <AddMembersPopup companyId={companyId} />
        </div>
      )}
    </div>
  );
};

export default CompanyMembers;
