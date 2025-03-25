// UserProfile.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import EditProfile from './EditProfil/EditProfil';
import './UserProfile.css';

const UserProfile = () => {
  const location = useLocation();
  const userFromState = location.state?.user;

  // On initialise profileData avec l'objet user reçu, ou un objet vide
  const [profileData, setProfileData] = useState(userFromState || {});
  const [showEditModal, setShowEditModal] = useState(false);

  // Récupérer les données complètes du profil depuis l'API dès que l'utilisateur est défini
  useEffect(() => {
    if (userFromState?.username) {
      axios.get(`/api/users/${userFromState.username}`)
        .then(res => setProfileData(res.data))
        .catch(err => console.error("Erreur lors de la récupération du profil :", err));
    }
  }, [userFromState]);

  // Si l'objet user n'est pas encore disponible, on affiche un message de chargement
  if (!userFromState) {
    return <div>Chargement du profil...</div>;
  }

  return (
    <div className="user-profile">
      {/* Header avec image de fond et photo de profil superposée */}
      <div className="profile-header">
        <img 
          src={profileData.backgroundPicUrl || '/uploads/default-background.jpg'} 
          alt="Background" 
          className="background-photo" 
        />
        <div className="profile-info">
          <img 
            src={profileData.profilePicUrl || '/uploads/default-profile.jpg'} 
            alt="Profil" 
            className="user-photo" 
          />
          <h1 className="user-name">{profileData.pseudo}</h1>
          {profileData.dateOfBirth && (
            <p className="user-dob">Né(e) le {new Date(profileData.dateOfBirth).toLocaleDateString()}</p>
          )}
          {profileData.website && (
            <a 
              href={profileData.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="user-website"
            >
              {profileData.website}
            </a>
          )}
          <button 
            onClick={() => setShowEditModal(true)} 
            className="edit-profile-button"
          >
            Modifier le profil
          </button>
        </div>
      </div>

      {/* Contenu principal avec sections d'informations */}
      <div className="profile-content">
        <section className="profile-section about-section">
          <h2>À propos de moi</h2>
          <p>{profileData.bio || "Aucune description fournie."}</p>
        </section>
        <section className="profile-section contact-section">
          <h2>Contact</h2>
          <p><strong>Email :</strong> {profileData.email || "Non renseigné"}</p>
          <p><strong>Téléphone :</strong> {profileData.phoneNumber || "Non renseigné"}</p>
        </section>
        {profileData.address && (
          <section className="profile-section address-section">
            <h2>Adresse</h2>
            <p>{profileData.address.street || ""}</p>
            <p>
              {profileData.address.city || ""}{profileData.address.city && profileData.address.state ? ", " : ""}{profileData.address.state || ""} {profileData.address.postalCode || ""}
            </p>
            <p>{profileData.address.country || ""}</p>
          </section>
        )}
      </div>

      {showEditModal && (
        <EditProfile 
          user={profileData} 
          onClose={() => {
            setShowEditModal(false);
            axios.get(`/api/users/${userFromState.username}`)
              .then(res => setProfileData(res.data))
              .catch(err => console.error("Erreur lors du rafraîchissement du profil :", err));
          }} 
        />
      )}
    </div>
  );
};

export default UserProfile;
