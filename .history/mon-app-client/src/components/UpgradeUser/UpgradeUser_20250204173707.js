import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './UpgradeUser.css';

const UpgradeUser = () => {
  const location = useLocation();
  const { user } = location.state || {}; // L'objet user doit contenir "username", "pseudo" et "role"

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpgradeRequest = async () => {
    if (!user || user.role !== 'utilisateur') {
      setMessage("Vous ne pouvez pas demander d'upgrade.");
      return;
    }
    setLoading(true);
    console.log("[FRONT] Sending upgrade request for user:", user);
    try {
      const response = await axios.post('http://localhost:3001/upgrade-request', {
        username: user.username,
      });
      console.log("[FRONT] Upgrade request response:", response.data);
      if (response.data.success) {
        setMessage('Votre demande d\'upgrade a été enregistrée.');
      } else {
        setMessage("Erreur lors de l'enregistrement de la demande.");
      }
    } catch (error) {
      console.error("[FRONT] Error sending upgrade request:", error);
      setMessage("Erreur lors de l'envoi de la demande.");
    }
    setLoading(false);
  };

  return (
    <div className="upgrade-user-container">
      <h1>Upgrade User</h1>
      {user ? (
        <div className="user-info">
          <p><strong>Pseudo :</strong> {user.pseudo || 'Non défini'}</p>
          <p><strong>Role :</strong> {user.role}</p>
          {user.role === 'utilisateur' ? (
            <button 
              className="upgrade-button" 
              onClick={handleUpgradeRequest} 
              disabled={loading}
            >
              {loading ? 'En cours...' : 'Demander un upgrade'}
            </button>
          ) : (
            <p>Vous êtes déjà {user.role}.</p>
          )}
          {message && <p className="message">{message}</p>}
        </div>
      ) : (
        <p>Aucune donnée utilisateur fournie.</p>
      )}
    </div>
  );
};

export default UpgradeUser;
