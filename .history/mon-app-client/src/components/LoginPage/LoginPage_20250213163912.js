import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/user/userActions';
import SignUpPage from '../SignUp/SignUp';

import api from '../api';


import './Login.css'

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      const response = await api.post('/login', { username, password });

      // 

      if (response.data.success) {
        // Stockez le token dans localStorage
        localStorage.setItem('token', response.data.token);
        dispatch(setUser({ pseudo: response.data.pseudo, ...response.data }));
       // Initialiser la connexion WebSocket
      const ws = new WebSocket('ws://localhost:3002', response.data.token);

      ws.onopen = () => console.log('WebSocket connecté');
      ws.onmessage = (message) => console.log('Message reçu:', message.data);
      ws.onclose = (event) => console.log('WebSocket déconnecté:', event.reason);
        navigate('/dashboard');
      } else {
        setErrorMessage(response.data.error || 'Erreur de connexion');
        setShowSignUp(true);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage('Utilisateur non trouvé. Veuillez vous inscrire.');
        setShowSignUp(true);
      } else {
        setErrorMessage(error.message || 'Erreur lors de la connexion');
      }
    }
  };

  return (
    <div className='login-block'>
      <h2>Login</h2>
      <form>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="button" onClick={handleLogin}>
          Login
        </button>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </form>
      {showSignUp && <SignUpPage role="utilisateur" />}
    </div>
  );
};

export default LoginPage;
