import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import CompanyMembers from '../CompanyMembers/CompanyMembers';
import Programs from '../Programs/Programs';
import DashboardTickets from '../DashboardTickets/DashboardTickets';
import './Company.css';

const Company = () => {
  const { companyId } = useParams();
  const location = useLocation();
  const user = location.state && location.state.user;

  const [companyData, setCompanyData] = useState(null);



  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axios.get(`/api/pending-companies/${companyId}`);
        setCompanyData(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données de la société :', error);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  return (
    <div className="company-container">
      <h2>Détails de l'entreprise</h2>
      {companyData ? (
        <div>
          <div className="company-info">
            <h3>{companyData.companyName}</h3>
            <img src={companyData.logo} alt={companyData.companyName} />
            <p>{companyData.description}</p>
          </div>

          <div className="projects-section">
            <Programs userId={user.userId} companyId={companyId}/>
          </div>

          <CompanyMembers companyId={companyId} userId={user.userId} />

          {/* Passer companyName pour récupérer et afficher les tickets liés à cette entreprise */}
          <DashboardTickets 
            companyId={companyId} 
            companyName={companyData.companyName} 
            user={user} 
          />
       </div>
      ) : (
        <p>Chargement des données de la société...</p>
      )}
    </div>
  );
};

export default Company;
