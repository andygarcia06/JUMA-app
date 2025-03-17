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
  }, [user]); // Mettre à jour lorsque l'utilisateur change

  const fetchValidatedCompanies = async () => {
    try {
      const response = await axios.get('/api/pending-companies-false');
      
      // Vérifier si response.data est un tableau, sinon accéder à la propriété contenant le tableau
      const companies = Array.isArray(response.data)
        ? response.data
        : response.data.companies;
      
      if (!companies) {
        console.error('Aucun tableau de compagnies trouvé dans la réponse');
        return;
      }

      const userValidatedCompanies = companies.filter(
        company => company.userId === user.userId && !company.pendingValidation
      );
      setValidatedCompanies(userValidatedCompanies);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises validées :', error);
    }
  };

  // Fonction pour gérer le clic sur le bouton "Voir la société"
  const handleViewCompany = (companyId) => {
    console.log('Voir la société avec ID:', companyId);
    // Vous pouvez rediriger ou afficher un modal avec plus d'infos
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
