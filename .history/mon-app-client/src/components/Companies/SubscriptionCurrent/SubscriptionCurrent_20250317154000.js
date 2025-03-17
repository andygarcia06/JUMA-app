import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const SubscriptionCurrent = () => {
  const [validatedCompanies, setValidatedCompanies] = useState([]);
  const location = useLocation();
  const user = location.state && location.state.user;

  useEffect(() => {
    if (user) {
      fetchValidatedCompanies();
    }
  }, [user]);

  const fetchValidatedCompanies = async () => {
    try {
      const response = await axios.get('/api/pending-companies-false');
      // On filtre en utilisant user.username qui correspond à l'identifiant de la société
      const userValidatedCompanies = response.data.filter(
        company => company.userId === user.username && !company.pendingValidation
      );
      setValidatedCompanies(userValidatedCompanies);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises validées :', error);
    }
  };

  const handleViewCompany = (companyId) => {
    console.log('Voir la société avec ID:', companyId);
    // Vous pouvez rediriger ou ouvrir un modal avec plus d'informations
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
