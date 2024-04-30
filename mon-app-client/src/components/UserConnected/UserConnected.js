// UserIcon.js
import React from 'react';

const UserConnected = ({ pseudo }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <span className="material-icons-outlined">account_circle</span>
    <span>{pseudo}</span>
  </div>
);

export default UserConnected;
