import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboardLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('/owner-login', {
        username,
        password
      });

      if (response.data.success) {
        // Stocker le token pour les futures requêtes
        localStorage.setItem('token', response.data.token);

        // Rediriger vers le DashboardAdmin
        navigate('/dashboard-admin');
      } else {
        setErrorMessage(response.data.error || 'Erreur lors de la connexion');
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.error || 'Erreur lors de la connexion');
      } else {
        setErrorMessage('Erreur lors de la connexion');
      }
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Connexion Owner</h2>
      <div>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Entrez votre username"
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Entrez votre password"
        />
      </div>
      <button onClick={handleLogin}>Se connecter</button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default AdminDashboardLogin;
