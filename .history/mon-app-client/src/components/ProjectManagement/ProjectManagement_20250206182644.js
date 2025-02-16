import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProjectManagement = () => {
  const [validatedCompanies, setValidatedCompanies] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  console.log("👤 Utilisateur connecté :", user);
  console.log("🆔 ID utilisateur connecté :", user?.userId);

  useEffect(() => {
    if (user && user.userId) {
      fetchValidatedCompanies();
    }
  }, [user]);

  const fetchValidatedCompanies = async () => {
    try {
      const response = await axios.get('/api/pending-companies');
      const pendingCompanies = response.data;
      console.log("🏢 Entreprises récupérées :", pendingCompanies);

      if (!user || !user.userId) {
        console.error("⚠️ Utilisateur non défini ou sans userId");
        return;
      }

      // Vérification du contenu des entreprises et de leurs membres
      pendingCompanies.forEach(company => {
        console.log(`🔎 Vérification entreprise : ${company.companyName}`);
        console.log("📜 Liste des membres :", company.members);
      });

      // Filtrer les entreprises où l'utilisateur est soit créateur, soit membre
      const validatedCompaniesData = pendingCompanies.filter(company => {
        const isCreator = company.userId === user.userId;
        console.log(`✅ Créateur ? ${isCreator} (UserId: ${company.userId} vs ${user.userId})`);

        const isMember = Array.isArray(company.members) && company.members.some(member => {
          console.log(`🔍 Vérification du membre ${member.userId} contre utilisateur ${user.userId}`);
          return String(member.userId).trim() === String(user.userId).trim();
        });

        console.log(`🛠 Résultat : ${isMember ? "✅ Utilisateur est membre" : "❌ Utilisateur n'est pas membre"}`);

        return isCreator || isMember;
      });

      console.log("📋 Entreprises validées pour l'utilisateur :", validatedCompaniesData);

      setValidatedCompanies(validatedCompaniesData);
      saveToProjectManagement(validatedCompaniesData);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des entreprises validées :", error);
    }
  };

  const saveToProjectManagement = async (companiesData) => {
    try {
      const response = await axios.post('/api/project-management', companiesData);
      console.log('✅ Données enregistrées dans la gestion de projet :', response.data);
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement des entreprises dans la gestion de projet :', error);
    }
  };

  const handleCompanyClick = (company) => {
    navigate(`/company/${company.id}`, { state: { user } });
  };

  return (
    <div>
      <h2>Gestion de Projet</h2>
      {validatedCompanies.length === 0 ? (
        <p>⚠️ Aucune entreprise trouvée pour cet utilisateur.</p>
      ) : (
        <ul>
          {validatedCompanies.map(company => (
            <li key={company.id} onClick={() => handleCompanyClick(company)}>
              <h4>{company.companyName}</h4>
              <p>{company.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProjectManagement;
