import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';


import axios from 'axios';

import './UserProfile.css';

function UserProfile({ username, pseudo }) {
    const [bio, setBio] = useState('');
      const navigate = useNavigate();
    
    const [editMode, setEditMode] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

  const [profilePic, setProfilePic] = useState(null);
  const [backgroundPic, setBackgroundPic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [backgroundPicUrl, setBackgroundPicUrl] = useState('');

    
    const user = useSelector((state) => state.user.userData);
    console.log(user);


  const handleBioChange = (e) => {
    setBio(e.target.value);
  };
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  const handleProfilePicChange = (e) => {
    setProfilePic(e.target.files[0]);
    setProfilePicUrl(URL.createObjectURL(e.target.files[0]));
  };
  const handleBackgroundPicChange = (e) => {
    setBackgroundPic(e.target.files[0]);
    setBackgroundPicUrl(URL.createObjectURL(e.target.files[0]));
  };

  const handleUpgradeUserClick = () => {
    navigate('/upgrade-user', { state: { user } });
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      if (profilePic) formData.append('profilePic', profilePic);
      if (backgroundPic) formData.append('backgroundPic', backgroundPic);
      formData.append('username', username);

      const bioResponse = await axios.post('http://localhost:3003/update-bio', { username, bio });
      console.log(bioResponse.data);

      if (profilePic) {
        const profilePicResponse = await axios.post('http://localhost:3003/upload-profile-picture', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log(profilePicResponse.data);
      }

      if (backgroundPic) {
        const backgroundPicResponse = await axios.post('http://localhost:3003/upload-background-picture', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log(backgroundPicResponse.data);
      }

      alert('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      alert('Erreur lors de la mise à jour du profil.');
    }
  };

  return (
    <div className="user-profile">
      <div className="profile-section">
        <img src={backgroundPicUrl || "../../../../server/uploads/default-background.jpg"} alt="Fond" className="background-photo" />
        <img src={profilePicUrl || "../../../../server/uploads/default-profile.jpg"} alt="Profil" className="user-photo" />
        <h1 className="user-name">{pseudo}</h1>
        {editMode ? (
          <textarea value={bio} onChange={handleBioChange} className="bio-input" />
        ) : (
          <p className="user-bio">{bio || 'Aucune bio disponible.'}</p>
        )}
        <button onClick={toggleEditMode} className="bio-button">
          {editMode ? 'Sauvegarder' : 'Ajouter votre bio'}
        </button>        <input type="file" onChange={handleProfilePicChange} accept="image/*" />
        <label>Photo de profil</label>
        <input type="file" onChange={handleBackgroundPicChange} accept="image/*" />
        <label>Photo de fond d'écran</label>
        <button onClick={handleSubmit}>Sauvegarder le profil</button>
      </div>
      <div className="trophies-section">
        {/* <div className="trophy">
          <span className="trophy-icon">🏆</span>
          <span className="trophy-count">7</span>
          <span className="trophy-label">Champions</span>
        </div>
        <div className="trophy">
          <span className="trophy-icon">👨‍🎓</span>
          <span className="trophy-count">4</span>
          <span className="trophy-label">Apprenants</span>
        </div> */}
      </div>
    </div>
  );
}

export default UserProfile;
