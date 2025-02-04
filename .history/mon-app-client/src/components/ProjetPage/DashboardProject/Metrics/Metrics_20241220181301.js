import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Metrics.css';  // Assurez-vous d'avoir un fichier CSS pour les couleurs

const Metrics = ({ companyId, programId, projectId, tabId, programName, companyName }) => {
  const [rows, setRows] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalActual, setTotalActual] = useState(0);
  const [totalRemainingBudget, setTotalRemainingBudget] = useState(0);

  useEffect(() => {
    // Récupérer les rows du projet
    const fetchRows = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/tabs/${tabId}/rows`, {
          params: { companyId, programId, projectId }
        });
        const fetchedRows = response.data.rows || [];
        setRows(fetchedRows);

        // Calculer les totaux du projet
        const totalBudget = fetchedRows.reduce((acc, row) => acc + row.budget, 0);
        const totalActual = fetchedRows.reduce((acc, row) => acc + row.actual, 0);
        const totalRemainingBudget = fetchedRows.reduce((acc, row) => acc + row.remainingBudget, 0);

        setTotalBudget(totalBudget);
        setTotalActual(totalActual);
        setTotalRemainingBudget(totalRemainingBudget);
      } catch (error) {
        console.error('Erreur lors de la récupération des rows:', error);
      }
    };

    fetchRows();
  }, [tabId, companyId, programId, projectId]);

  // Calcul du Gain Fonctionnel (Exemple simplifié)
  const calculateFunctionalGain = () => {
    // Utilisez des critères réels pour calculer l'amélioration de la performance.
    const totalGoal = rows.reduce((acc, row) => acc + (row.goal ? 1 : 0), 0); // Nombre d'objectifs atteints
    return totalGoal; // Exemple : nombre d'objectifs atteints
  };

  // Calcul du TCO
  const calculateTCO = () => {
    // Exemple de calcul simplifié pour le TCO (ajoutez vos propres calculs)
    const implementationCost = 50000; // Exemple de coût d'implémentation
    const maintenanceCost = 10000; // Exemple de coût annuel de maintenance
    const years = 3; // Durée du calcul sur 3 ans
    return implementationCost + (maintenanceCost * years);
  };

  // Calcul du ROI
  const calculateROI = () => {
    const tco = calculateTCO();
    const savings = totalBudget - totalActual; // Exemple de bénéfice net : économie réalisée
    return (savings / tco) * 100; // ROI en pourcentage
  };

  return (
    <div className="metrics">
      <h3>Metrics du projet {projectId}</h3>
      <div>
        <h4>Gain Fonctionnel</h4>
        <p>Amélioration des performances (Objectifs atteints) : {calculateFunctionalGain()}</p>
      </div>
      <div>
        <h4>TCO (Coût Total de Possession)</h4>
        <p>TCO estimé pour 3 ans : {calculateTCO()} €</p>
      </div>
      <div>
        <h4>ROI (Retour sur Investissement)</h4>
        <p>ROI estimé : {calculateROI()}%</p>
      </div>

      <h3>Sommes des lignes</h3>
      <p>Total Budget: {totalBudget} €</p>
      <p>Total Réel: {totalActual} €</p>
      <p>Total Budget Restant: {totalRemainingBudget} €</p>
    </div>
  );
};

export default Metrics;
