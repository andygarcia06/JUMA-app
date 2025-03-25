// UserProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditProfile from './EditProfil/EditProfile';
import './UserProfile.css';

const UserProfile = ({ user }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState(user);
  const navigate = useNavigate();

  // On peut récupérer le profil depuis l'API en cas de mise à jour
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/api/users/${user.username}`);
        setProfileData(res.data);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
      }
    };
    fetchUser();
  }, [user.username]);

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    // Rafraîchir le profil après mise à jour
    axios.get(`/api/users/${user.username}`)
      .then(res => setProfileData(res.data))
      .catch(err => console.error("Erreur lors du rafraîchissement du profil :", err));
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

      <div className="profile-details">
        <p><strong>Email:</strong> {profileData.email}</p>
        <p><strong>Téléphone:</strong> {profileData.phoneNumber}</p>
        {profileData.address && (
          <>
            <p><strong>Adresse:</strong> {profileData.address.street}, {profileData.address.city}</p>
            <p><strong>Région:</strong> {profileData.address.state} {profileData.address.postalCode}</p>
            <p><strong>Pays:</strong> {profileData.address.country}</p>
          </>
        )}
        {/* Vous pouvez ajouter d'autres infos (site web, date de naissance, etc.) */}
      </div>
    </div>
  );
};

export default UserProfile;
