import React from 'react';
import { useLocation } from 'react-router-dom';

const SupportTicketing = () => {
  const location = useLocation();
  const { user } = location.state || {};

  console.log("Données de l'utilisateur dans SupportTicketing :", user);

  return (
    <div>
      <h1>Support Ticketing</h1>
      {/* Utilisez les données utilisateur ici si nécessaire */}
    </div>
  );
};

export default SupportTicketing;
