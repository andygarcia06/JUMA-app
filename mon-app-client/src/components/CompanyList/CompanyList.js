// CompaniesList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CompaniesList.css';
import { MdDelete } from 'react-icons/md'; // Assurez-vous d'avoir installé react-icons (npm install react-icons)

const CompaniesList = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Récupérer la liste des companies depuis l'API
  useEffect(() => {
    axios.get('/api/all-companies')
      .then(res => {
        console.log("CompaniesList: Données reçues :", res.data);
        setCompanies(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("CompaniesList: Erreur lors de la récupération des companies :", err);
        setLoading(false);
      });
  }, []);

  // Fonction pour supprimer une company
  const handleDelete = (companyId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette company ?")) {
      axios.delete(`/api/companies/${companyId}`)
        .then(res => {
          console.log("CompaniesList: Company supprimée :", res.data);
          setCompanies(companies.filter(company => company.id !== companyId));
        })
        .catch(err => {
          console.error("CompaniesList: Erreur lors de la suppression de la company :", err);
          alert("Erreur lors de la suppression de la company");
        });
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="companies-list-container">
      <h2>Liste des companies</h2>
      {companies.length === 0 ? (
        <p>Aucune company enregistrée.</p>
      ) : (
        companies.map(company => (
          <div key={company.id} className="company-card">
            <div className="company-details">
              <h3 className="company-name">{company.companyName}</h3>
              <p className="company-creator">
                Créé par : {company.userId || 'Inconnu'}
              </p>
            </div>
            <div className="company-actions">
              <button className="delete-button" onClick={() => handleDelete(company.id)}>
                <MdDelete size={24} color="#e74c3c" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CompaniesList;
