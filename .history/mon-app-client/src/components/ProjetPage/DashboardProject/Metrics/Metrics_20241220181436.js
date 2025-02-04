import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Metrics.css';  // Assurez-vous d'avoir un fichier CSS pour la mise en forme des carrés

const Metrics = ({ companyId, programId, projectId, tabId, programName, companyName }) => {
  const [rows, setRows] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalActual, setTotalActual] = useState(0);
  const [totalRemainingBudget, setTotalRemainingBudget] = useState(0);

  useEffect(() => {
    const fetchRows = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/tabs/${tabId}/rows`, {
          params: { companyId, programId, projectId }
        });
        const fetchedRows = response.data.rows || [];
        setRows(fetchedRows);

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

  const calculateFunctionalGain = () => {
    const totalGoal = rows.reduce((acc, row) => acc + (row.goal ? 1 : 0), 0);
    return totalGoal;
  };

  const calculateTCO = () => {
    const implementationCost = 50000;
    const maintenanceCost = 10000;
    const years = 3;
    return implementationCost + (maintenanceCost * years);
  };

  const calculateROI = () => {
    const tco = calculateTCO();
    const savings = totalBudget - totalActual;
    return (savings / tco) * 100;
  };

  return (
    <div className="metrics">
      <h3>Metrics du projet {projectId}</h3>
      <div className="metrics-container">
        {/* Gain fonctionnel */}
        <div className="metric-box">
          <h4>Gain Fonctionnel</h4>
          <p>{calculateFunctionalGain()}</p>
        </div>

        {/* TCO */}
        <div className="metric-box">
          <h4>TCO</h4>
          <p>{calculateTCO()} €</p>
        </div>

        {/* ROI */}
        <div className="metric-box">
          <h4>ROI</h4>
          <p>{calculateROI()}%</p>
        </div>

        {/* Total Budget */}
        <div className="metric-box">
          <h4>Total Budget</h4>
          <p>{totalBudget} €</p>
        </div>

        {/* Total Réel */}
        <div className="metric-box">
          <h4>Total Réel</h4>
          <p>{totalActual} €</p>
        </div>

        {/* Total Budget Restant */}
        <div className="metric-box">
          <h4>Total Budget Restant</h4>
          <p>{totalRemainingBudget} €</p>
        </div>
      </div>
    </div>
  );
};

export default Metrics;
