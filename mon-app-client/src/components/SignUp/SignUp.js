import React, { useState } from 'react';
import axios from 'axios';

import '../LoginPage/Login.css'


const SignUpPage = ({ role }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState(''); // Ajout d'un état pour le pseudo
  const [email, setEmail] = useState('');
const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignUp = async () => {
    console.log({ username, password, pseudo, email, phoneNumber });
    console.log('Rôle lors de l\'inscription :', role)
  

    try {
      const response = await axios.post('/signup', {
        username,
        password,
        pseudo,
        email,
        phoneNumber,
        role: role, // Utilisez le rôle passé en prop
      });
      

      if (response.data.success) {
        setSuccessMessage('Inscription réussie !');
      } else {
        setErrorMessage(response.data.error || 'Erreur d\'inscription');
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.error || 'Erreur d\'inscription');
      } else if (error.request) {
        setErrorMessage('Pas de réponse du serveur');
      } else {
        setErrorMessage('Erreur lors de l\'inscription');
      }
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
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
        <div>
          <label>Pseudo:</label>
          <input
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
          />
        </div>
        <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        </div>
        <div>
        <label>Phone Number:</label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </div>

        <button type="button" onClick={handleSignUp}>
          Sign Up
        </button>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      </form>
    </div>
  );
};

export default SignUpPage;
