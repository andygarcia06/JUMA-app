import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ValidationCompanies = () => {
  const [loading, setLoading] = useState(false);
  const [pendingCompanies, setPendingCompanies] = useState([]);

  useEffect(() => {
    fetchPendingCompanies();
  }, []);

  const fetchPendingCompanies = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/pending-companies');
      setPendingCompanies(response.data.filter(company => company.pendingValidation)); // Filtrer les entreprises en attente de validation
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises en attente de validation :', error);
      setLoading(false);
    }
  };

  const handleValidateCompany = async (companyId) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:3001/api/pending-companies/${companyId}`, { pendingValidation: false });
      // Actualiser automatiquement la liste des entreprises après la validation
      setPendingCompanies(prevPendingCompanies => prevPendingCompanies.filter(company => company.id !== companyId));
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la validation de l\'entreprise :', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Entreprises en attente de validation</h3>
      {loading && <p>Chargement en cours...</p>}
      {!loading && pendingCompanies.length === 0 && <p>Aucune entreprise en attente de validation pour le moment.</p>}
      {!loading && pendingCompanies.length > 0 && pendingCompanies.map((company, index) => (
        <div key={index}>
          <h4>{company.companyName}</h4>
          <p>{company.description}</p>
          <p>Catégorie : {company.category}</p>
          <p>Créateur : {company.userId}</p>
          <button onClick={() => handleValidateCompany(company.id)}>Valider</button>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default ValidationCompanies;
