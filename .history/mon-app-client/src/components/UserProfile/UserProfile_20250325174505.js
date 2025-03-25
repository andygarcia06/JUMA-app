// UserProfile.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import EditProfile from './EditProfil/EditProfile';
import './UserProfile.css';

const UserProfile = () => {
  const location = useLocation();
  // On récupère l'objet user passé dans state lors de la navigation
  const user = location.state?.user;

  // On déclare les hooks même si user est potentiellement undefined
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState(user || {});

  useEffect(() => {
    if (user && user.username) {
      axios.get(`/api/users/${user.username}`)
        .then(res => setProfileData(res.data))
        .catch(err => console.error("Erreur lors de la récupération du profil :", err));
    }
  }, [user]);

  if (!user) {
    return <div>Chargement du profil...</div>;
  }

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
      <button onClick={() => setShowEditModal(true)} className="edit-profile-button">Modifier le profil</button>
      {showEditModal && (
        <EditProfile user={profileData} onClose={() => {
          setShowEditModal(false);
          axios.get(`/api/users/${user.username}`)
            .then(res => setProfileData(res.data))
            .catch(err => console.error("Erreur lors du rafraîchissement du profil :", err));
        }} />
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
      </div>
    </div>
  );
};

export default UserProfile;
