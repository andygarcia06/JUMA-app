import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Assurez-vous d'ajouter le fichier CSS pour le style

const HomePage = () => {
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    // Rediriger vers la page de connexion de l'admin (à créer)
    navigate('/admin-login', { state: { role: 'admin' } });

  };

  const handleUserLogin = () => {
    // Rediriger vers la page de connexion utilisateur existante
    navigate('/login', { state: { role: 'utilisateur' } });
  };

  return (
    <div className="home-page">
      <h1>JUMA</h1>
      <div className="login-icons">
        <div className="login-icon" onClick={handleAdminLogin}>
          <p>Login Admin</p>
        </div>
        <div className="login-icon" onClick={handleUserLogin}>
          <p>Login</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
