import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProjectRows.css'; // Assurez-vous d'ajouter un fichier CSS pour gérer les couleurs

const ProjectRows = ({ companyId, programId, projectId, tabId }) => {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  // Charger les rows depuis le serveur
  useEffect(() => {
    const fetchRows = async () => {
      try {
        const response = await axios.get(`/tabs/${tabId}/rows`, {
          params: { companyId, programId, projectId },
        });
        console.log('Rows récupérées:', response.data.rows);
        setRows(response.data.rows);
      } catch (error) {
        console.error('Erreur lors de la récupération des rows:', error);
        setError('Erreur lors de la récupération des données.');
      }
    };

    fetchRows();
  }, [companyId, programId, projectId, tabId]);

  const handleStatusChange = async (rowId, newStatus) => {
    // Mettre à jour l'état local
    const updatedRows = rows.map((row) =>
      row.rowId === rowId ? { ...row, status: newStatus } : row
    );
    setRows(updatedRows);

    // Envoyer la modification au serveur
    try {
      const rowToUpdate = updatedRows.find((row) => row.rowId === rowId);
      await axios.put(`http://localhost:3001/tabs/${tabId}/rows/${rowId}`, {
        ...rowToUpdate,
        status: newStatus,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut :', error);
      setError('Erreur lors de la mise à jour du statut.');
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'En cours':
        return 'status-in-progress';
      case 'Terminé':
        return 'status-completed';
      case 'Null':
        return 'status-null';
      default:
        return '';
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <table>
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
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr key={row.rowId}>
                <td>{row.rowName}</td>
                <td>{row.owner}</td>
                <td>{row.goal}</td>
                <td className={`priority-${row.priority.toLowerCase()}`}>{row.priority}</td>
                <td>{row.type}</td>
                <td>{row.budget}</td>
                <td>{row.actual}</td>
                <td>{row.remainingBudget}</td>
                <td>
                  <select
                    value={row.status}
                    onChange={(e) => handleStatusChange(row.rowId, e.target.value)}
                    className={getStatusColor(row.status)}
                  >
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                    <option value="Null">Null</option>
                  </select>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="9">Aucune donnée à afficher</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectRows;
