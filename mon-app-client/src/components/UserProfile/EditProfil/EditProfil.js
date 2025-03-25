// EditProfile.js
import React, { useState } from 'react';
import axios from 'axios';
import './EditProfil.css';

const EditProfile = ({ user, onClose }) => {
  console.log("EditProfile: Received user:", user);
  
  // Utilisation de user.username et user.userId
  const [bio, setBio] = useState(user.bio || '');
  const [email, setEmail] = useState(user.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [profilePic, setProfilePic] = useState(null);
  const [backgroundPic, setBackgroundPic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState(user.profilePicUrl || '');
  const [backgroundPicUrl, setBackgroundPicUrl] = useState(user.backgroundPicUrl || '');
  
  // Champs d'adresse
  const [street, setStreet] = useState(user.address?.street || '');
  const [city, setCity] = useState(user.address?.city || '');
  const [state, setState] = useState(user.address?.state || '');
  const [postalCode, setPostalCode] = useState(user.address?.postalCode || '');
  const [country, setCountry] = useState(user.address?.country || '');

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    console.log("EditProfile: Profile pic file selected:", file);
    setProfilePic(file);
    setProfilePicUrl(URL.createObjectURL(file));
  };

  const handleBackgroundPicChange = (e) => {
    const file = e.target.files[0];
    console.log("EditProfile: Background pic file selected:", file);
    setBackgroundPic(file);
    setBackgroundPicUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("EditProfile: handleSubmit called");
    try {
      const formData = new FormData();
      console.log("EditProfile: Adding fields to formData");
      // Envoi à la fois de username et userId
      formData.append('username', user.username || '');
      formData.append('userId', user.userId || '');
      formData.append('bio', bio);
      formData.append('email', email);
      formData.append('phoneNumber', phoneNumber);
      formData.append('street', street);
      formData.append('city', city);
      formData.append('state', state);
      formData.append('postalCode', postalCode);
      formData.append('country', country);

      if (profilePic) {
        console.log("EditProfile: Adding profilePic file to formData");
        formData.append('profilePic', profilePic);
      }
      if (backgroundPic) {
        console.log("EditProfile: Adding backgroundPic file to formData");
        formData.append('backgroundPic', backgroundPic);
      }

      console.log("EditProfile: Submitting formData to /api/update-profile");
      const response = await axios.put('/api/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log("EditProfile: Profil mis à jour:", response.data);
      alert('Profil mis à jour avec succès');
      onClose();
    } catch (error) {
      console.error('EditProfile: Erreur lors de la mise à jour du profil:', error);
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
            <textarea 
              value={bio} 
              onChange={(e) => {
                console.log("EditProfile: Bio changed to", e.target.value);
                setBio(e.target.value);
              }} 
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => {
                console.log("EditProfile: Email changed to", e.target.value);
                setEmail(e.target.value);
              }} 
            />
          </div>
          <div className="form-group">
            <label>Téléphone</label>
            <input 
              type="text" 
              value={phoneNumber} 
              onChange={(e) => {
                console.log("EditProfile: PhoneNumber changed to", e.target.value);
                setPhoneNumber(e.target.value);
              }} 
            />
          </div>
          {/* Champs d'adresse */}
          <div className="form-group">
            <label>Rue</label>
            <input 
              type="text" 
              value={street} 
              onChange={(e) => {
                console.log("EditProfile: Street changed to", e.target.value);
                setStreet(e.target.value);
              }} 
            />
          </div>
          <div className="form-group">
            <label>Ville</label>
            <input 
              type="text" 
              value={city} 
              onChange={(e) => {
                console.log("EditProfile: City changed to", e.target.value);
                setCity(e.target.value);
              }} 
            />
          </div>
          <div className="form-group">
            <label>Région / État</label>
            <input 
              type="text" 
              value={state} 
              onChange={(e) => {
                console.log("EditProfile: State changed to", e.target.value);
                setState(e.target.value);
              }} 
            />
          </div>
          <div className="form-group">
            <label>Code Postal</label>
            <input 
              type="text" 
              value={postalCode} 
              onChange={(e) => {
                console.log("EditProfile: PostalCode changed to", e.target.value);
                setPostalCode(e.target.value);
              }} 
            />
          </div>
          <div className="form-group">
            <label>Pays</label>
            <input 
              type="text" 
              value={country} 
              onChange={(e) => {
                console.log("EditProfile: Country changed to", e.target.value);
                setCountry(e.target.value);
              }} 
            />
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
            <button type="button" onClick={() => { 
              console.log("EditProfile: onClose called");
              onClose();
            }}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
