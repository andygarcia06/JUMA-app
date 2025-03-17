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
      // Appel à la nouvelle route qui renvoie toutes les entreprises en attente de validation
      const response = await axios.get('/api/companies/pending');
      // La route renvoie déjà uniquement les entreprises dont pendingValidation est true
      setPendingCompanies(response.data);
      console.log("Réponse API:", response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises en attente de validation :', error);
      setLoading(false);
    }
  };

  const handleValidateCompany = async (companyId) => {
    try {
      setLoading(true);
      // Utilisation de la route dédiée pour valider l'entreprise
      await axios.put(`/api/validate-company/${companyId}`);
      // Actualisation locale : on retire l'entreprise validée de la liste
      setPendingCompanies(prev => prev.filter(company => company.id !== companyId));
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la validation de l'entreprise :", error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Entreprises en attente de validation</h3>
      {loading && <p>Chargement en cours...</p>}
      {!loading && pendingCompanies.length === 0 && (
        <p>Aucune entreprise en attente de validation pour le moment.</p>
      )}
      {!loading && pendingCompanies.length > 0 &&
        pendingCompanies.map((company) => (
          <div key={company.id}>
            <h4>{company.companyName}</h4>
            <p>{company.description}</p>
            <p>Catégorie : {company.category}</p>
            <p>Créateur : {company.userId}</p>
            <button onClick={() => handleValidateCompany(company.id)}>Valider</button>
            <hr />
          </div>
        ))
      }
    </div>
  );
};

export default ValidationCompanies;
