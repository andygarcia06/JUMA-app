// AdminDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardAdmin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleUpdateUsers = () => {
    // Redirige vers le composant UpdateUsersAdmin
    navigate('/update-users-admin');
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
    </div>
  );
};

export default AdminDashboard;
