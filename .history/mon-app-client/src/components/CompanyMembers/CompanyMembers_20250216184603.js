import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddMembersPopup from '../AddMembers/AddMembers'; // Import du composant AddMembersPopup

const CompanyMembers = ({ companyId, userId }) => {
  const [userOwner, setUserOwner] = useState([]);
  const [members, setMembers] = useState([]); // État pour stocker les membres de l'entreprise
  const [showAddMemberPopup, setShowAddMemberPopup] = useState(false); // État pour afficher/cacher la popup d'ajout de membre
  useEffect(() => {
    // Fonction pour récupérer les membres de l'entreprise
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`/api/company/${companyId}/members`);
        setMembers(response.data.members); // Mettre à jour les membres de l'entreprise avec la réponse de l'API

      } catch (error) {
        console.error('Erreur lors de la récupération des membres de l\'entreprise :', error);
      }
    };

    fetchMembers(); // Appeler la fonction pour récupérer les membres de l'entreprise
  }, [companyId]); // Déclencher l'effet lorsque l'ID de la société change
  
  useEffect(() => {
    // Fonction pour récupérer les détails de l'utilisateur propriétaire de la société
    const fetchUserOwner = async () => {
      try {
        const response = await axios.get('/api/pending-companies'); // Utilisez la route que vous avez fournie pour récupérer les détails de l'utilisateur propriétaire
        const company = response.data.find(item => item.id === companyId); // Rechercher l'objet avec le companyId spécifique
        if (company) {
          const ownerUserId = company.userId; // Extraire le userId de l'objet trouvé
          setUserOwner(ownerUserId); // Mettre à jour les détails de l'utilisateur propriétaire avec le userId de la société
        } else {
          console.error('CompanyId non trouvé dans les données.');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur propriétaire de la société :', error);
      }
    };

    fetchUserOwner(); // Appeler la fonction pour récupérer les détails de l'utilisateur propriétaire
  }, [companyId]); // Déclencher l'effet lorsque l'ID de la société change
console.log(userOwner)

  
  // Fonction pour afficher/cacher la popup d'ajout de membre
  const toggleAddMemberPopup = () => {
    setShowAddMemberPopup(!showAddMemberPopup);
  };

  return (
    <div>
      <h3>Membres de l'entreprise</h3>
      <ul>
        {members.map(member => (
          <li key={member.userId}>{member.email}</li>
        ))}
      </ul>

      {userId === userOwner && (
  <button onClick={toggleAddMemberPopup}>Ajouter un membre</button>
)}

{/* Popup d'ajout de membre */}
{showAddMemberPopup && userId === userOwner && (
  <div className="add-member-popup">
    {/* Afficher le composant AddMembersPopup en tant que popup */}
    <AddMembersPopup companyId={companyId} userId={userId.userId} />
  </div>
)}
    </div>
  );
};

export default CompanyMembers;
