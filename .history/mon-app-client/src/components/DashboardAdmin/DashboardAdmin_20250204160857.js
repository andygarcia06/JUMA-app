import React from 'react';
import './DashboardAdmin.css';

const AdminDashboard = () => {
  const handleUpdateUsers = () => {
    // Ici, vous ajouterez la logique pour mettre à jour les utilisateurs
    console.log("Update Users clicked");
  };

  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>
      <button className="update-users-button" onClick={handleUpdateUsers}>
        <div className="icon">
          {/* Exemple d'icône Font Awesome : */}
          <span className="material-icons-outlined">group</span>
          </div>
        <div className="button-label">Update Users</div>
      </button>
    </div>
  );
};

export default AdminDashboard;
