// DashboardAdmin.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardAdmin.css';
import CompanyList from './CompanyList/CompanyList'

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleUpdateUsers = () => {
    navigate('/update-users-admin');
  };

  const handleDBEnrichment = () => {
    navigate('/db-enrichment-ticket'); // Redirige vers DBEnrichmentTicket
  };

  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>
      
      <button className="update-users-button" onClick={handleUpdateUsers}>
        <div className="icon">
          <span className="material-icons-outlined">group</span>
        </div>
        <div className="button-label">Update Users</div>
      </button>

      {/* ✅ Nouveau bouton pour enrichir la BDD météo projet */}
      <button className="db-enrichment-button" onClick={handleDBEnrichment}>
        <div className="icon">
          <span className="material-icons-outlined">cloud_upload</span>
        </div>
        <div className="button-label">Enrichir la BDD Météo Projet</div>
      </button>
      <CompanyList />

    </div>
  );
};

export default AdminDashboard;
