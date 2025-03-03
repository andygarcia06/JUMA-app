import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProjectRows.css';  // Assurez-vous d'avoir un fichier CSS pour les couleurs
import { FaRegCommentDots } from 'react-icons/fa';  // Icône de dialogue
import ProjectUnderRows from './ProjectUnderRow/ProjectUnderRow';  // Importer le composant ProjectUnderRows

const ProjectRows = ({ companyId, programId, projectId, tabId }) => {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);  // Ajouter un état pour la ligne sélectionnée

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

  // Fonction pour afficher la sous-ligne de ProjectUnderRows
  const handleOpenUnderRow = (rowId) => {
    setSelectedRowId(rowId === selectedRowId ? null : rowId); // Toggle l'affichage de la sous-ligne
  };

  // Calcul des sommes
  const totalBudget = rows.reduce((acc, row) => acc + row.budget, 0);
  const totalActual = rows.reduce((acc, row) => acc + row.actual, 0);
  const totalRemainingBudget = rows.reduce((acc, row) => acc + row.remainingBudget, 0);

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
            <th>Fonctionnel</th> {/* Nouvelle colonne pour l'icône */}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <React.Fragment key={row.rowId}>
              <tr>
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
                <td
                  style={{
                    backgroundColor: getStatusColor(row.status),
                    color: row.status === 'Terminé' ? 'white' : 'black'
                  }}
                >
                  <select
                    value={row.status}
                    onChange={(e) => handleStatusChange(row.rowId, e.target.value)}
                    style={{
                      backgroundColor: getStatusColor(row.status),
                      color: row.status === 'Terminé' ? 'white' : 'black',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '5px',
                      width: '100px'
                    }}
                  >
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                    <option value="Null">Null</option>
                  </select>
                </td>
                <td>
                  <FaRegCommentDots 
                    style={{ cursor: 'pointer', fontSize: '20px' }} 
                    onClick={() => handleOpenUnderRow(row.rowId)} 
                  />
                </td>
              </tr>
              {/* Affichage de la sous-ligne lorsque l'icône est cliquée */}
              {selectedRowId === row.rowId && <ProjectUnderRows rowId={row.rowId} />}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Affichage des sommes */}
      <div className="project-rows-sommes">
        <h3>Sommes des lignes</h3>
        <p>Total Budget: {totalBudget}</p>
        <p>Total Réel: {totalActual}</p>
        <p>Total Budget Restant: {totalRemainingBudget}</p>
      </div>
    </div>
  );
};

export default ProjectRows;
