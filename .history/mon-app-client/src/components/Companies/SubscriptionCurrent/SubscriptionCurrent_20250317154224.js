import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const SubscriptionCurrent = () => {
  const [validatedCompanies, setValidatedCompanies] = useState([]);
  const location = useLocation();

  // Récupérer user depuis location.state ou localStorage
  const userFromState = location.state && location.state.user;
  const user = userFromState || JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (user) {
      console.log("User info in SubscriptionCurrent:", user);
      fetchValidatedCompanies();
    } else {
      console.error("User is undefined in SubscriptionCurrent");
    }
  }, [user]);

  const fetchValidatedCompanies = async () => {
    try {
      const response = await axios.get('/api/pending-companies-false');
      console.log("Response from API:", response.data);
      // On filtre en utilisant user.username (assurez-vous que cet attribut existe et vaut "1" pour l'utilisateur connecté)
      const userValidatedCompanies = response.data.filter(
        company => company.userId === user.username && !company.pendingValidation
      );
      console.log("Filtered companies:", userValidatedCompanies);
      setValidatedCompanies(userValidatedCompanies);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises validées :', error);
    }
  };

  const handleViewCompany = (companyId) => {
    console.log('Voir la société avec ID:', companyId);
    // Ici, vous pouvez rediriger ou afficher un modal pour plus d'informations
  };

  return (
    <div>
      <h3>Abonnement Actuel</h3>
      <ul>
        {validatedCompanies.map(company => (
          <li key={company.id}>
            <h4>{company.companyName}</h4>
            <p>{company.description}</p>
            <button onClick={() => handleViewCompany(company.id)}>Voir la société</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubscriptionCurrent;
