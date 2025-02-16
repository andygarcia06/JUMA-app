import React, { useState } from 'react';

import axios from 'axios';

const AddPhase = ({ 
  companyId,
  userId,
  programId,
  programName,
  programDescription,
  programManager,
  projectData,
  lot,
  br,
  addPhase
}) => {
  const [phaseName, setPhaseName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  console.log(br)

  const handleAddPhase = async () => {
    // Vérifier si les champs sont remplis
    if (!phaseName || !startDate || !endDate) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    // Créer l'objet de la nouvelle phase
    const newPhase = {
      phaseName,
      startDate,
      endDate
    };

    try {
      // Effectuer une requête POST pour ajouter la phase
      const response = await axios.post('http://localhost:3001/api/projects/' + projectData.id + '/lots/' + lot.id + '/brs/' + br.id + '/phases', newPhase);
      
      // Appeler la fonction d'ajout de phase fournie par le parent
      addPhase(newPhase);

      // Réinitialiser les champs du formulaire après l'ajout de la phase
      setPhaseName('');
      setStartDate('');
      setEndDate('');

      // Afficher un message de succès ou rediriger l'utilisateur si nécessaire
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la phase :', error);
      // Afficher un message d'erreur à l'utilisateur si la requête échoue
    }
  };

  return (
    <div>
      <h3>Ajouter une phase</h3>
      <label>Nom de la phase:</label>
      <input type="text" value={phaseName} onChange={(e) => setPhaseName(e.target.value)} />
      <label>Date de début:</label>
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={projectData.startDate} max={projectData.endDate} />
      <label>Date de fin:</label>
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} max={projectData.endDate} />
      <button onClick={handleAddPhase}>Ajouter la phase</button>
    </div>
  );
};

export default AddPhase;
