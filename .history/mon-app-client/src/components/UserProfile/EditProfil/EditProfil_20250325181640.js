// EditProfile.js (extrait)
import React, { useState } from 'react';
import axios from 'axios';
import './EditProfil.css';

const EditProfile = ({ user, onClose }) => {
  const [bio, setBio] = useState(user.bio || '');
  const [email, setEmail] = useState(user.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [profilePic, setProfilePic] = useState(null);
  const [backgroundPic, setBackgroundPic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(user.profilePicUrl || '');
  const [backgroundPicUrl, setBackgroundPicUrl] = useState(user.backgroundPicUrl || '');
  
  // Champs d'adresse...
  const [street, setStreet] = useState(user.address?.street || '');
  const [city, setCity] = useState(user.address?.city || '');
  const [state, setState] = useState(user.address?.state || '');
  const [postalCode, setPostalCode] = useState(user.address?.postalCode || '');
  const [country, setCountry] = useState(user.address?.country || '');

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
      formData.append('username', user.username);  // S'assurer que username est présent
      formData.append('bio', bio);
      formData.append('email', email);
      formData.append('phoneNumber', phoneNumber); // Renommé de "phone" à "phoneNumber"
      formData.append('street', street);
      formData.append('city', city);
      formData.append('state', state);
      formData.append('postalCode', postalCode);
      formData.append('country', country);

      if (profilePic) formData.append('profilePic', profilePic);
      if (backgroundPic) formData.append('backgroundPic', backgroundPic);

      const response = await axios.put('/api/update-profile', formData, {
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
            <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>
          {/* Champs pour l'adresse */}
          <div className="form-group">
            <label>Rue</label>
            <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Ville</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Région / État</label>
            <input type="text" value={state} onChange={(e) => setState(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Code Postal</label>
            <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Pays</label>
            <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          {/* Champs pour les images */}
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
