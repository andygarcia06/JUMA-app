import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CompanyMembers from '../CompanyMembers/CompanyMembers'; // Importer le composant CompanyMembers
import Programs from '../Programs/Programs';
import './Company.css'; // Importer le fichier CSS pour les styles personnalisés

const Company = () => {
  const { companyId } = useParams();
  const location = useLocation();
  const user = location.state && location.state.user;
  const navigate = useNavigate();

  const [companyData, setCompanyData] = useState(null); // État pour stocker les données de la société
  const [projects, setProjects] = useState([]); // État pour stocker les projets de l'entreprise
  const [members, setMembers] = useState([]); // État pour stocker les membres de l'entreprise

  useEffect(() => {
    // Fonction pour récupérer les données de la société correspondante
    const fetchCompanyData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/pending-companies/${companyId}`);
        setCompanyData(response.data); // Mettre à jour les données de la société avec la réponse de l'API
      } catch (error) {
        console.error('Erreur lors de la récupération des données de la société :', error);
      }
    };

    // Fonction pour récupérer les projets de l'entreprise


    fetchCompanyData(); // Appeler la fonction pour récupérer les données de la société // Appeler la fonction pour récupérer les projets de l'entreprise
  }, [companyId]); // Déclencher l'effet lorsque l'ID de la société change

  useEffect(() => {
    // Fonction pour récupérer les membres de l'entreprise
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/company/${companyId}/members`);
        setMembers(response.data); // Mettre à jour les membres de l'entreprise avec la réponse de l'API
      } catch (error) {
        console.error('Erreur lors de la récupération des membres de l\'entreprise :', error);
      }
    };

    fetchMembers(); // Appeler la fonction pour récupérer les membres de l'entreprise
  }, [companyId]); // Déclencher l'effet lorsque l'ID de la société change

  // Gérer le clic sur le bouton "Add Project"


  return (
    <div className="company-container">
      <h2>Company Details</h2>
      {companyData ? ( // Vérifier si les données de la société sont disponibles
        <div>
          <div className="company-info">
            <h3>{companyData.companyName}</h3> {/* Afficher le nom de la société */}
            <img src={companyData.logo} alt={companyData.companyName} /> {/* Afficher le logo de la société */}
            <p>{companyData.description}</p> {/* Afficher la description de la société */}
          </div>

          {/* Encart des projets de l'entreprise */}
          <div className="projects-section">
            <Programs userId={user.userId} companyId={companyId}/>
          </div>

          {/* Encart des membres de l'entreprise */}
          <CompanyMembers companyId={companyId} userId={user.userId}  />
        </div>
      ) : (
        <p>Chargement des données de la société...</p> // Afficher un message de chargement si les données de la société ne sont pas encore disponibles
      )}
    </div>
  );
};

export default Company;
