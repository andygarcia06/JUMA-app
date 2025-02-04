import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddLotPopup from './AddLotPopup/AddLotPopup';
import Lot from '../Lot/LotPage'; // Importer le composant Lot
import './Projet.css'

const Projet = () => {
  const { projectId } = useParams();
  const navigate = useNavigate(); // Hook useNavigate pour la navigation
  const [projectData, setProjectData] = useState({});
  const [lots, setLots] = useState([]);
  const [showAddLotPopup, setShowAddLotPopup] = useState(false);

  const handleToggleAddLotPopup = () => {
    setShowAddLotPopup(!showAddLotPopup);
  };

  // Fonction pour naviguer vers le composant Lot.js avec les données du lot sélectionné
  const handleLotClick = (lot) => {
    navigate(`/lot/${lot.id}`, { state: { lot, projectData} }); // Passer les données du lot et du projet à Lot.js
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Utilisez l'ID du projet pour récupérer les données du projet
        const response = await axios.get(`http://localhost:3001/api/projects/${projectId}`);
        console.log(response.data.lots)
        setProjectData(response.data);
        setLots(response.data.lots); // Mettre à jour la liste des lots
      } catch (error) {
        console.error('Erreur lors de la récupération des données du projet :', error);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Affichez les données du projet dans le composant
  return (
    <div>
      <h2>{projectData.projectName}</h2>
      <p>Date de début: {projectData.startDate}</p>
      <p>Date de fin: {projectData.endDate}</p>
      <p>Participants: {projectData.participants && projectData.participants.join(', ')}</p>

      {/* Afficher la liste des lots */}
      <h3>Liste des Lots:</h3>
      <div className="lots-container">
        {lots.map(lot => (
          <div key={lot.id} className="lot-item" onClick={() => handleLotClick(lot)}>
            <p className="lot-name">Nom du lot: {lot.lotName}</p>
            <p className="lot-description">Description du lot: {lot.lotDescription}</p>
          </div>
        ))}
      </div>

      {/* Bouton pour ouvrir/fermer le popup d'ajout de lots */}
      <button onClick={handleToggleAddLotPopup}>Ajouter des Lots</button>

      {/* Popup pour ajouter des lots */}
      {showAddLotPopup && (
        <AddLotPopup
          // Passer les données nécessaires à AddLotPopup
          projectId={projectData.id}
          participants={projectData.participants}
          startDate={projectData.startDate}
          endDate={projectData.endDate}
          handleClosePopup={handleToggleAddLotPopup}
        />
        
      )}
    </div>
  );
};

export default Projet;
