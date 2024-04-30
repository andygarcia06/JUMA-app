// LeftMenu.js

import React from 'react';
import { Link } from 'react-router-dom';
import './LeftMenu.css'; // Importez le fichier CSS pour les styles du menu

const LeftMenu = () => {
  return (
    <div className="left-menu">
      <Link to="/rewards">Activer Rewards</Link>
      <Link to="/true-reward">Réduction & Billeterie</Link>
    </div>
  );
};

export default LeftMenu;
