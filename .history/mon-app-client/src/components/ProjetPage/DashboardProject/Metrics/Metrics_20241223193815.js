import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Metrics.css';  // Assurez-vous d'avoir un fichier CSS pour la mise en forme des carrés

const Metrics = ({ companyId, programId, projectId, programName, companyName }) => {
  const [tabs, setTabs] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalActual, setTotalActual] = useState(0);
  const [totalRemainingBudget, setTotalRemainingBudget] = useState(0);
  const [functionalGain, setFunctionalGain] = useState(0); // Ajouter un état pour stocker les gains fonctionnels
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTabs = async () => {
      try {
        // Récupérer les tabs du projet
        const response = await axios.get(`http://localhost:3001/projects/${projectId}/tabs`, {
          params: { companyId, programId },
        });
        setTabs(response.data.tabs || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des tabs:', error);
        setError('Erreur lors de la récupération des tabs.');
      }
    };

    fetchTabs();
  }, [companyId, programId, projectId]);

  useEffect(() => {
    const fetchRowsFromAllTabs = async () => {
      try {
        let totalBudgetValue = 0;
        let totalActualValue = 0;
        let totalRemainingBudgetValue = 0;
        let totalFunctionalGain = 0;  // Initialiser la somme des gains fonctionnels

        // Récupérer les rows de chaque tab et calculer les sommes
        for (let tab of tabs) {
          const response = await axios.get(`http://localhost:3001/tabs/${tab.tabId}/rows`, {
            params: { companyId, programId, projectId },
          });
          const rows = response.data.rows || [];

          // Ajouter les valeurs de chaque row aux totaux
          rows.forEach(row => {
            totalBudgetValue += row.budget;
            totalActualValue += row.actual;
            totalRemainingBudgetValue += row.remainingBudget;

            // Ajouter les gains fonctionnels des projets fonctionnels de chaque ligne
            if (row.functionalProjects && row.functionalProjects.length > 0) {
              row.functionalProjects.forEach(functionalProject => {
                totalFunctionalGain += parseFloat(functionalProject.estimatedGain || 0);
              });
            }
          });
        }

        setTotalBudget(totalBudgetValue);
        setTotalActual(totalActualValue);
        setTotalRemainingBudget(totalRemainingBudgetValue);
        setFunctionalGain(totalFunctionalGain);  // Mettre à jour les gains fonctionnels

      } catch (error) {
        console.error('Erreur lors de la récupération des rows:', error);
        setError('Erreur lors de la récupération des rows.');
      }
    };

    if (tabs.length > 0) {
      fetchRowsFromAllTabs();
    }
  }, [tabs, companyId, programId, projectId]);

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
        {/* Gain fonctionnel total (inclut les gains fonctionnels des functional rows) */}
        <div className="metric-box">
          <h4>Gain Fonctionnel</h4>
          <p>{functionalGain}</p> {/* Afficher la somme des gains fonctionnels */}
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
