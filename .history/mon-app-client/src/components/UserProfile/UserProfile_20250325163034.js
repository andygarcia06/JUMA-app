// UserProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditProfile from './EditProfil/EditProfil';
import './UserProfile.css';

const UserProfile = ({ user }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState(user);
  const navigate = useNavigate();

  // Vous pouvez également récupérer le profil depuis votre API si besoin

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    // Optionnel : rafraîchir le profil après mise à jour
    // axios.get('/api/user/' + user.username)...
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <img src={profileData.backgroundPicUrl || '/uploads/default-background.jpg'} alt="Fond" className="background-photo" />
        <img src={profileData.profilePicUrl || '/uploads/default-profile.jpg'} alt="Profil" className="user-photo" />
        <h1 className="user-name">{profileData.pseudo}</h1>
      </div>
      <div className="profile-bio">
        <p>{profileData.bio || 'Aucune bio disponible.'}</p>
      </div>
      <button onClick={handleEditClick} className="edit-profile-button">Modifier le profil</button>

      {showEditModal && (
        <EditProfile user={profileData} onClose={handleCloseModal} />
      )}

      {/* Autres informations importantes du profil */}
      <div className="profile-details">
        <p><strong>Email:</strong> {profileData.email}</p>
        <p><strong>Téléphone:</strong> {profileData.phone}</p>
        {/* Ajoutez d'autres infos essentielles ici */}
      </div>
    </div>
  );
};

export default UserProfile;
