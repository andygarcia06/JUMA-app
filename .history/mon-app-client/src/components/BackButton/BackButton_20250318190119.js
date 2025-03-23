import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'react-feather'; // Icône de flèche
import './BackButton.css'; // Import du style

const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <button onClick={handleBack} className="back-button">
      <ArrowLeft />
    </button>
  );
};

export default BackButton;
