// UserProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditProfile from './EditProfil/EditProfile';
import './UserProfile.css';

const UserProfile = ({ user }) => {
  // Si user n'est pas défini, on affiche un message ou on retourne null
  if (!user) {
    return <div>Chargement du profil...</div>;
  }

  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState(user);
  const navigate = useNavigate();

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
        <EditProfile user={profileData} onClose
