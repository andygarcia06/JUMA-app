import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/user/userActions';
import SignUpPage from '../SignUp/SignUp';

import '../LoginPage/Login.css';

const LoginAdminPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleAdminLogin = async () => {
    console.log('Tentative de connexion Admin');

    try {
      const response = await axios.post('/admin-login', {
        username,
        password,
        role: 'admin', // Ajout du rôle 'admin'
      });

      console.log('Réponse reçue:', response);

      if (response.data.success) {
        console.log('Connexion réussie, stockage du token et redirection');

        // Stockez le token dans localStorage
        localStorage.setItem('token', response.data.token);
        dispatch(setUser({ pseudo: response.data.pseudo, ...response.data }));
        navigate('/dashboard?role=admin');
        console.log('Redirection vers le tableau de bord');

        console.log('Nom de l\'utilisateur :', response.data.pseudo);
        console.log('Rôle de l\'utilisateur :', response.data.role);
      } else {
        console.log('Erreur de connexion:', response.data.error);

        setErrorMessage(response.data.error || 'Erreur de connexion');
        setShowSignUp(true);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('Erreur lors de la tentative de connexion:', error);

        setErrorMessage('Utilisateur non trouvé. Veuillez vous inscrire.');
        setShowSignUp(true);
      } else {
        console.log('Erreur inattendue lors de la connexion:', error);
        setErrorMessage(error.message || 'Erreur lors de la connexion');
      }
    }
  };

  return (
    <div className='login-block'>
      <h2>Login Admin</h2> {/* Modifiez le titre pour indiquer la connexion en tant qu'administrateur */}
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
        <button type="button" onClick={handleAdminLogin}>
          Login Admin {/* Modifiez le texte du bouton */}
        </button>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </form>
      {showSignUp && <SignUpPage role="admin" />}
    </div>
  );
};

export default LoginAdminPage;
