import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DashboardRewardsGets({ user }) {
  const [message, setMessage] = useState('Chargement...');

  useEffect(() => {
    if (!user || !user.userId) return;

    axios.get(`/api/dashboard-rewards-gets/${user.userId}`)
      .then(response => {
        // Pour l’instant, c’est un placeholder
        if (response.data && response.data.message) {
          setMessage(response.data.message);
        } else {
          setMessage("Aucune information de récompenses pour le moment.");
        }
      })
      .catch(error => {
        console.error('Erreur fetch rewards-gets :', error);
        setMessage("Erreur lors de la récupération des récompenses.");
      });
  }, [user]);

  return (
    <div>
      <h3>Récompenses</h3>
      <p>{message}</p>
    </div>
  );
}

export default DashboardRewardsGets;
