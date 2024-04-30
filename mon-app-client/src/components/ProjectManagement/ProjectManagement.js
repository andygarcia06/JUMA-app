import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Importez useNavigate depuis react-router-dom
import axios from 'axios';

const ProjectManagement = () => {
  const [validatedCompanies, setValidatedCompanies] = useState([]);
  const location = useLocation();
  const navigate = useNavigate(); // Utilisez useNavigate pour la navigation
  const user = location.state && location.state.user;

  useEffect(() => {
    if (user) {
      fetchValidatedCompanies();
    }
  }, [user]);


  const fetchValidatedCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/pending-companies');
      const pendingCompanies = response.data;
      console.log(pendingCompanies)

    // Filtrer les entreprises pour inclure celles où l'utilisateur est soit le créateur, soit un membre
    const validatedCompaniesData = pendingCompanies.filter(company =>
        company.userId === user.userId || 
        (company.members && company.members.some(member => member.userId === user.userId))
      );
        console.log('Données reçues pour la gestion de projet :', validatedCompaniesData);
      setValidatedCompanies(validatedCompaniesData);
      saveToProjectManagement(validatedCompaniesData);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises validées :', error);
    }
  };

  const saveToProjectManagement = async (companiesData) => {
    try {
      const response = await axios.post('http://localhost:3001/api/project-management', companiesData);
      console.log('Réponse du serveur pour l\'enregistrement dans la gestion de projet :', response.data);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des entreprises dans la gestion de projet :', error);
    }
  };

  // Fonction pour gérer le clic sur une entreprise
  const handleCompanyClick = (company) => {
    // Naviguer vers la page de détails de l'entreprise avec les informations sur l'utilisateur
    navigate(`/company/${company.id}`, { state: { user: user } });
  };

  return (
    <div>
      <h2>Gestion de Projet</h2>
      <ul>
        {validatedCompanies.map(company => (
          // Utilisez onClick pour gérer le clic sur l'entreprise
          <li key={company.id} onClick={() => handleCompanyClick(company)}>
            <h4>{company.companyName}</h4>
            <p>{company.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectManagement;
