// UpdateUsersAdmin.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UpdateUsersAdmin.css';

const UpdateUsersAdmin = () => {
  const navigate = useNavigate();
  const [upgradeRequests, setUpgradeRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Récupérer la liste des demandes d'upgrade depuis le serveur
  useEffect(() => {
    const fetchUpgradeRequests = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3001/upgrade-requests');
        if (response.data.success) {
          setUpgradeRequests(response.data.requests);
        } else {
          setError('Erreur lors de la récupération des demandes.');
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des demandes :", err);
        setError('Erreur serveur.');
      }
      setLoading(false);
    };
    fetchUpgradeRequests();
  }, []);

  const handleApprove = async (request) => {
    try {
      // Appel de la route PUT pour mettre à jour le rôle de l'utilisateur et retirer la demande
      const response = await axios.put('http://localhost:3001/update-role', {
        username: request.username,
        newRole: 'admin'
      });
      if (response.data.success) {
        // Optionnel : vous pouvez également mettre à jour le fichier JSON pour supprimer ou réinitialiser le flag upgradeRequested
        setUpgradeRequests((prev) =>
          prev.filter((req) => req.username !== request.username)
        );
      }
    } catch (error) {
      console.error('Erreur lors de la validation de la demande :', error);
    }
  };

  return (
    <div className="update-users-admin-container">
      <h1>Update Users Admin</h1>
      <p>Ici, le owner peut valider ou refuser les demandes d'upgrade des utilisateurs.</p>
      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : upgradeRequests.length > 0 ? (
        <ul className="requests-list">
          {upgradeRequests.map((req) => (
            <li key={req.username} className="request-item">
              <p>
                <strong>Pseudo :</strong> {req.pseudo}
              </p>
              <p>
                <strong>Role actuel :</strong> {req.role}
              </p>
              <button onClick={() => handleApprove(req)}>Valider Upgrade</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucune demande d'upgrade en attente.</p>
      )}
      <button className="back-button" onClick={() => navigate('/dashboard-admin')}>
        Retour Dashboard
      </button>
    </div>
  );
};

export default UpdateUsersAdmin;
