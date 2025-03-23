import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BackButton from '../../BackButton/BackButton'

import './style.css'

const ProjectManagement = () => {
  const [creatorCompanies, setCreatorCompanies] = useState([]); // Entreprises où l'utilisateur est créateur
  const [memberCompanies, setMemberCompanies] = useState([]); // Entreprises où l'utilisateur est membre
  const [activeTab, setActiveTab] = useState("creator"); // Onglet actif
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  console.log("👤 Utilisateur connecté :", user);
  console.log("🆔 ID utilisateur connecté :", user?.userId);

  useEffect(() => {
    if (user && user.userId) {
      fetchUserCompanies();
    }
  }, [user]);

  const fetchUserCompanies = async () => {
    try {
      // Récupérer toutes les entreprises
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

      // Séparer les entreprises en deux catégories :
      const creatorCompaniesData = pendingCompanies.filter(company => company.userId === user.pseudo);
      const memberCompaniesData = pendingCompanies.filter(company => 
        Array.isArray(company.members) && 
        company.members.some(member => String(member.userId).trim() === String(user.pseudo).trim())
      );

      console.log("📋 Entreprises où l'utilisateur est créateur :", creatorCompaniesData);
      console.log("📋 Entreprises où l'utilisateur est membre :", memberCompaniesData);

      setCreatorCompanies(creatorCompaniesData);
      setMemberCompanies(memberCompaniesData);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des entreprises :", error);
    }
  };

  const handleCompanyClick = (company) => {
    navigate(`/company/${company.id}`, { state: { user } });
  };

  return (
    <div>
      <h2>Gestion de Projet</h2>

      {/* Navigation entre les onglets */}
      <div className="tabs">
        <button 
          className={activeTab === "creator" ? "active" : ""}
          onClick={() => setActiveTab("creator")}
        >
          Mes entreprises (Créateur)
        </button>
        <button 
          className={activeTab === "member" ? "active" : ""}
          onClick={() => setActiveTab("member")}
        >
          Entreprises dont je suis membre
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === "creator" ? (
        <div>
          <h3>Entreprises créées par moi</h3>
          {creatorCompanies.length === 0 ? (
            <p>⚠️ Vous n'avez créé aucune entreprise.</p>
          ) : (
            <ul>
              {creatorCompanies.map(company => (
                <li key={company.id} onClick={() => handleCompanyClick(company)}>
                  <h4>{company.companyName}</h4>
                  <p>{company.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div>
          <h3>Entreprises dont je suis membre</h3>
          {memberCompanies.length === 0 ? (
            <p>⚠️ Vous n'êtes membre d'aucune entreprise.</p>
          ) : (
            <ul>
              {memberCompanies.map(company => (
                <li key={company.id} onClick={() => handleCompanyClick(company)}>
                  <h4>{company.companyName}</h4>
                  <p>{company.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
