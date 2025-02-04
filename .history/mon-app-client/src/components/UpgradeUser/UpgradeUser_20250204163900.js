// UpgradeUser.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UpgradeUser.css';

const UpgradeUser = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = location.state || {};

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpgradeRequest = async () => {
    if (user.role !== 'utilisateur') {
      setMessage("Vous ne pouvez pas demander d'upgrade.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/upgrade-request', {
        username: user.username,
      });
      if (response.data.success) {
        setMessage('Votre demande d\'upgrade a été enregistrée.');
      } else {
        setMessage("Erreur lors de l'enregistrement de la demande.");
      }
    } catch (error) {
      console.error("Erreur lors de la demande d'upgrade :", error);
      setMessage("Erreur lors de l'envoi de la demande.");
    }
    setLoading(false);
  };

  return (
    <div className="upgrade-user-container">
      <h1>Upgrade User</h1>
      {user ? (
        <div className="user-info">
          <p><strong>Pseudo :</strong> {user.pseudo}</p>
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
