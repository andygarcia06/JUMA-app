import React from 'react';
import { useNavigate } from 'react-router-dom';
import useUser from '../../hooks/useUser'; // 🔥 Import du hook personnalisé

const BackButton = () => {
  const navigate = useNavigate();
  const user = useUser(); // 🔥 Récupère `user` automatiquement

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <button onClick={handleBack} className="back-button">
      ← Précédent {user ? `(Connecté en tant que ${user.pseudo})` : ""}
    </button>
  );
};

export default BackButton;
