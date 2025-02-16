import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProjectRows.css';  // Assurez-vous d'avoir un fichier CSS pour les couleurs

const ProjectRows = ({ companyId, programId, projectId, tabId }) => {
  const [rows, setRows] = useState([]);

  // Fonction pour récupérer les rows depuis le serveur
  useEffect(() => {
    const fetchRows = async () => {
      try {
        const response = await axios.get(`/tabs/${tabId}/rows`, {
          params: { companyId, programId, projectId }
        });
        setRows(response.data.rows || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des rows:', error);
      }
    };

    fetchRows();
  }, [tabId, companyId, programId, projectId]);

  // Fonction pour appliquer les couleurs de priorité
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Élevé':
        return 'red';
      case 'Moyen':
        return 'orange';
      case 'Basse':
        return 'green';
      default:
        return 'gray';
    }
  };

  // Fonction pour appliquer les couleurs de statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'En cours':
        return 'yellow';
      case 'Terminé':
        return 'green';
      case 'Null':
        return 'gray';
      default:
        return 'white';
    }
  };

  return (
    <div>
      <table className="project-rows-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Propriétaire</th>
            <th>Objectif</th>
            <th>Priorité</th>
            <th>Type</th>
            <th>Budget</th>
            <th>Réel</th>
            <th>Budget Restant</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.rowId}>
              <td>{row.rowName}</td>
              <td>{row.owner}</td>
              <td>{row.goal}</td>
              <td style={{ backgroundColor: getPriorityColor(row.priority) }}>
                {row.priority}
              </td>
              <td>{row.type}</td>
              <td>{row.budget}</td>
              <td>{row.actual}</td>
              <td>{row.remainingBudget}</td>
              <td style={{ backgroundColor: getStatusColor(row.status) }}>
                {row.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Affichage des sommes */}
      <ProjectRowsSommes rows={rows} />
    </div>
  );
};

const ProjectRowsSommes = ({ rows }) => {
  const totalBudget = rows.reduce((acc, row) => acc + row.budget, 0);
  const totalActual = rows.reduce((acc, row) => acc + row.actual, 0);
  const totalRemainingBudget = rows.reduce((acc, row) => acc + row.remainingBudget, 0);

  return (
    <div className="project-rows-sommes">
      <h3>Sommes des lignes</h3>
      <p>Total Budget: {totalBudget}</p>
      <p>Total Réel: {totalActual}</p>
      <p>Total Budget Restant: {totalRemainingBudget}</p>
    </div>
  );
};

export default ProjectRows;
