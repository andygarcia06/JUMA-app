import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const SubscriptionCurrent = () => {
  const [validatedCompanies, setValidatedCompanies] = useState([]);
  const location = useLocation();
  const user = location.state && location.state.user;

  useEffect(() => {
    fetchValidatedCompanies();
  }, [user]); // Mettre à jour lorsque l'utilisateur change

  const fetchValidatedCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/pending-companies-false');
      const userValidatedCompanies = response.data.filter(company => company.userId === user.userId && !company.pendingValidation);
      setValidatedCompanies(userValidatedCompanies);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises validées :', error);
    }
  };

  // Fonction pour gérer le clic sur le bouton "Voir la société"
  const handleViewCompany = (companyId) => {
    // Vous pouvez implémenter ici le comportement souhaité lors du clic sur le bouton
    // Par exemple, rediriger l'utilisateur vers la page de détails de la société
    // ou ouvrir un modal avec plus d'informations sur la société
    console.log('Voir la société avec ID:', companyId);
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
