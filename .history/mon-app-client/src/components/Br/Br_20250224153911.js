import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import PhaseListItem from './PhaseList/PhaseList'; // Assurez-vous d'importer correctement le composant PhaseListItem
import './style.css'
import AddPhase from './AddPhase/AddPhase'

const BRPage = () => {
  const location = useLocation();
  const { companyId, userId, programId, programName, programDescription, programManager, projectData, lot, br } = location.state;
  const [showAddPhasePopup, setShowAddPhasePopup] = useState(false);
  const [phases, setPhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);

  // Fonction pour ajouter une phase au BR
  const addPhase = (newPhase) => {
    setPhases([...phases, newPhase]);
  };

  // Récupérer les phases depuis l'API
  useEffect(() => {
    const fetchPhases = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectData.id}/lots/${lot.id}/brs/${br.id}/phases`);
        setPhases(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des phases :', error);
      }
    };

    fetchPhases();
  }, [projectData.id, lot.lotId, br.id]);

  // Fonction pour afficher les détails de la phase dans un popup
  const showPhaseDetails = (phase) => {
    setSelectedPhase(phase);
  };

  // Fonction pour fermer le popup des détails de la phase
  const closePhaseDetailsPopup = () => {
    setSelectedPhase(null);
  };

 return (
  <div>
    <h2>Détails du Besoin/Réalisation (BR)</h2>
    <p>Nom du BR : {br.brName}</p>
    <p>Description du BR : {br.brDescription}</p>
    <p>Participants :</p>
    <ul>
      {br.participants && br.participants.map((participant, i) => (
        <li key={i}>{participant}</li>
      ))}
    </ul>
    <p>ID du projet associé : {br.projectId}</p>
    <p>ID du lot associé : {br.lotId}</p>
    {/* Affichage des phases */}
    <h3>Phases :</h3>
    <ul className='phase-list'>
      {phases.map((phase, index) => (
        <PhaseListItem
          key={index}
          phase={phase}
          showPhaseDetails={showPhaseDetails}
          selectedPhase={selectedPhase}
        />
      ))}
    </ul>
    <button onClick={() => setShowAddPhasePopup(true)}>Ajouter des phases</button>
    {showAddPhasePopup && (
      <AddPhase
        companyId={companyId}
        userId={userId}
        programId={programId}
        programName={programName}
        programDescription={programDescription}
        programManager={programManager}
        projectData={projectData}
        lot={lot}
        br={br}
        addPhase={addPhase}
      />
    )}
  </div>
);
};

export default BRPage;
