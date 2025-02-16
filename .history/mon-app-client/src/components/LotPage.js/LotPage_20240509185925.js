import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddBRPopup from './AddBrPopup/AddBrPopup'; 
import './style.css'

const LotPage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Import de useNavigate pour la navigation
  const [brList, setBrList] = useState([]);
  const [showAddBRPopup, setShowAddBRPopup] = useState(false);
  const { companyId, userId, programId, programName, programDescription, programManager, projectData, lot } = location.state;

console.log(lot.id, projectData.id)
  const handleOpenAddBRPopup = () => {
    setShowAddBRPopup(true);
  };

  const handleAccessBR = (br) => {
    // Naviguer vers le composant BR avec les données nécessaires
    navigate(`/br/${br.id}`, { 
        state: { 
            lot, 
            projectData, 
            br
        } 
    });
};

  const handleCloseAddBRPopup = () => {
    setShowAddBRPopup(false);
  };

  const addBR = (newBr) => {
    setBrList([...brList, newBr]);
  };

  const handleBrClick = (br) => {
    // Naviguer vers le composant BR avec les données nécessaires
    navigate(`/br/${br.id}`, { 
        state: { 
            companyId,
            userId,
            programId,
            programName,
            programDescription,
            programManager,
            projectData, 
            lot, 
            br
        } 
    });
  };



  useEffect(() => {
    const fetchBRs = async () => {
      try {
        // Vérifier si projectData et lot sont définis
        if (!projectData || !lot) return;
  
        console.log('Fetching BRs with project ID:', projectData.id, 'and lot ID:', lot.id);
  
        const response = await axios.get(`http://localhost:3001/api/projects/${projectData.id}/lots/${lot.id}/brs`);
        setBrList(response.data);
        console.log('BRs fetched successfully:', response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des BR :', error);
      }
    };
  
    fetchBRs();
  }, [lot.id, projectData.id]);
  

  return (
    <div>
      <h2>Détails du Lot</h2>
      <p>Nom du lot : {lot.lotName}</p>
      <p>Description du lot : {lot.lotDescription}</p>
      <p>ID du projet associé : {projectData.id}</p>
      <p>Nom du projet associé : {projectData.projectName}</p>

      <h3>Participants du Lot:</h3>
      <ul>
        {lot.participants && lot.participants.map((participant, index) => (
          <li key={index}>{participant}</li>
        ))}
      </ul>

      <div>
        <h3>Besoins/Réalisations (BR)</h3>
        <ul>
    {brList.filter(br => br !== null).map((br, index) => (
      <li key={index}>
        <div className="br-container">
          <div>
            <p>Nom du BR : {br && br.brName}</p>
            <p>Description du BR : {br && br.brDescription}</p>
            <p>Participants :</p>
            <ul>
              {br && br.participants.map((participant, i) => (
                <li key={i}>{participant}</li>
              ))}
            </ul>
            <p>ID du projet associé : {br && br.projectId}</p>
            <p>ID du lot associé : {br && br.lotId}</p>
          </div>
          <button onClick={() => handleBrClick(br)}>Accéder à la BR</button>
        </div>
      </li>
    ))}
  </ul>
      </div>

      <button onClick={handleOpenAddBRPopup}>Ajouter un BR</button>

      {showAddBRPopup && (
        <AddBRPopup
          lotId={lot.id}
          participants={lot.participants}
          handleClosePopup={handleCloseAddBRPopup}
          projectId={projectData.id}
          addBR={addBR}
        />
      )}
    </div>
  );
};

export default LotPage;
