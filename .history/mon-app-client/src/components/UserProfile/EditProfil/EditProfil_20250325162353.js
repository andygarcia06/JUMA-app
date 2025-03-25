// EditProfile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditProfile.css';

const EditProfile = ({ user, onClose }) => {
  const [bio, setBio] = useState(user.bio || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [profilePic, setProfilePic] = useState(null);
  const [backgroundPic, setBackgroundPic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(user.profilePicUrl || '');
  const [backgroundPicUrl, setBackgroundPicUrl] = useState(user.backgroundPicUrl || '');

  // Gestion des changements d'image
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    setProfilePicUrl(URL.createObjectURL(file));
  };

  const handleBackgroundPicChange = (e) => {
    const file = e.target.files[0];
    setBackgroundPic(file);
    setBackgroundPicUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('username', user.username);
      formData.append('bio', bio);
      formData.append('email', email);
      formData.append('phone', phone);
      if (profilePic) formData.append('profilePic', profilePic);
      if (backgroundPic) formData.append('backgroundPic', backgroundPic);

      const response = await axios.post('http://localhost:3003/api/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Profil mis à jour:', response.data);
      alert('Profil mis à jour avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      alert('Erreur lors de la mise à jour du profil');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="edit-profile-modal">
        <h2>Modifier le profil</h2>
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label>Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Téléphone</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Photo de profil</label>
            <input type="file" accept="image/*" onChange={handleProfilePicChange} />
            {profilePicUrl && <img src={profilePicUrl} alt="Profil prévisualisé" className="preview-image" />}
          </div>
          <div className="form-group">
            <label>Photo de fond</label>
            <input type="file" accept="image/*" onChange={handleBackgroundPicChange} />
            {backgroundPicUrl && <img src={backgroundPicUrl} alt="Fond prévisualisé" className="preview-image" />}
          </div>
          <div className="form-actions">
            <button type="submit">Sauvegarder</button>
            <button type="button" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
