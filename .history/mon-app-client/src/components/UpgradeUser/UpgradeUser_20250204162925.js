import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UpgradeUser.css';

const UpgradeUser = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Récupération des informations de l'utilisateur transmises lors de la navigation
  const { user } = location.state || {};

  // États pour gérer le message, le chargement et le rôle actuel (pour mettre à jour l'affichage après upgrade)
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState(user?.role || '');

  // Fonction appelée lors du clic sur le bouton "Demander un upgrade"
  const handleUpgrade = async () => {
    // On ne peut demander un upgrade que si l'utilisateur a le rôle "utilisateur"
    if (currentRole !== 'utilisateur') {
      setMessage("Votre rôle ne peut pas être mis à jour.");
      return;
    }
    setLoading(true);
    try {
      // Envoi de la requête PUT pour mettre à jour le rôle de l'utilisateur
      const response = await axios.put('http://localhost:3001/update-role', {
        username: user.username,
        newRole: 'admin'
      });

      if (response.data.success) {
        setMessage("Upgrade réussi ! Votre rôle est désormais admin.");
        setCurrentRole('admin');
      } else {
        setMessage("Erreur lors de la mise à jour du rôle.");
      }
    } catch (error) {
      console.error("Erreur lors de l'upgrade :", error);
      setMessage("Erreur lors de la mise à jour du rôle.");
    }
    setLoading(false);
  };

  return (
    <div className="upgrade-user-container">
      <h1>Upgrade User</h1>
      {user ? (
        <div className="user-info">
          <p><strong>Pseudo :</strong> {user.pseudo}</p>
          <p><strong>Role :</strong> {currentRole}</p>
          {currentRole === 'utilisateur' ? (
            <button 
              className="upgrade-button" 
              onClick={handleUpgrade} 
              disabled={loading}
            >
              {loading ? 'En cours...' : 'Demander un upgrade'}
            </button>
          ) : (
            <p>Vous êtes déjà admin.</p>
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
