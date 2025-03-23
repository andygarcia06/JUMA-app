import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProjectRows.css';
import { FaRegCommentDots } from 'react-icons/fa';

const ProjectRows = ({ companyId, programId, projectId, tabId }) => {
  const [rows, setRows] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [functionalProjectData, setFunctionalProjectData] = useState({
    name: '',
    estimatedGain: '',
    projectType: '',
    resourcesRequired: '',
    startDate: '',
    endDate: '',
    status: 'En cours'
  });

  // Récupération des rows
  useEffect(() => {
    const fetchRows = async () => {
      try {
        const response = await axios.get(`/tabs/${tabId}/rows`, {
          params: { companyId, programId, projectId }
        });
        console.log("Rows récupérées :", response.data.rows);
        setRows(response.data.rows || []);
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des rows:', error);
      }
    };

    if (tabId && companyId && programId && projectId) {
      fetchRows();
    }
  }, [tabId, companyId, programId, projectId]);

  // Fonction de gestion des changements dans le formulaire
  const handleChangeFunctionalData = (e) => {
    const { name, value } = e.target;
    setFunctionalProjectData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Soumission du projet fonctionnel
  const handleSubmitFunctionalProject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        companyId,
        programId,
        tabId,
        rowId: selectedRowId,
        functionalProject: functionalProjectData
      };

      console.log("🚀 Envoi du projet fonctionnel :", payload);
      const response = await axios.post(`/projects/${projectId}/functional`, payload);
      console.log("✅ Projet fonctionnel ajouté :", response.data);

      // Mise à jour locale : ajout du projet fonctionnel à la ligne correspondante
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.rowId === selectedRowId
            ? {
                ...row,
                functionalProjects: row.functionalProjects
                  ? [...row.functionalProjects, response.data.functionalProject]
                  : [response.data.functionalProject]
              }
            : row
        )
      );

      // Réinitialiser le formulaire et fermer la sous-ligne
      setFunctionalProjectData({
        name: '',
        estimatedGain: '',
        projectType: '',
        resourcesRequired: '',
        startDate: '',
        endDate: '',
        status: 'En cours'
      });
      setSelectedRowId(null);
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du projet fonctionnel:', error);
    }
  };

  // Gestion du changement de statut d'une ligne
  const handleStatusChange = async (rowId, newStatus) => {
    const updatedRows = rows.map((row) =>
      row.rowId === rowId ? { ...row, status: newStatus } : row
    );
    setRows(updatedRows);
    try {
      const rowToUpdate = updatedRows.find((row) => row.rowId === rowId);
      await axios.put(`/tabs/${tabId}/rows/${rowId}`, {
        ...rowToUpdate,
        status: newStatus
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut :', error);
    }
  };

  // Ouvrir ou fermer la sous-ligne pour ajouter un projet fonctionnel
  const handleOpenUnderRow = (rowId) => {
    setSelectedRowId((prev) => (prev === rowId ? null : rowId));
  };

  // Calcul des sommes
  const totalBudget = rows.reduce((acc, row) => acc + (row.budget || 0), 0);
  const totalActual = rows.reduce((acc, row) => acc + (row.actual || 0), 0);
  const totalRemainingBudget = rows.reduce((acc, row) => acc + (row.remainingBudget || 0), 0);

  // Fonctions pour déterminer les couleurs (si besoin)
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
            <th>Fonctionnel</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <React.Fragment key={row.rowId}>
              <tr>
                <td>{row.rowName}</td>
                <td>{row.owner}</td>
                <td>{row.goal}</td>
                <td>{row.priority}</td>
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
              {/* Affichage du formulaire pour ajouter un projet fonctionnel */}
              {selectedRowId === row.rowId && (
                <tr>
                  <td colSpan="10">
                    <div className="project-under-row">
                      <form onSubmit={handleSubmitFunctionalProject}>
                        <h4>Ajouter un Projet Fonctionnel</h4>
                        <div>
                          <label>Nom du projet :</label>
                          <input
                            type="text"
                            name="name"
                            placeholder="Nom du projet"
                            value={functionalProjectData.name}
                            onChange={handleChangeFunctionalData}
                          />
                        </div>
                        <div>
                          <label>Gain Estimé :</label>
                          <input
                            type="number"
                            name="estimatedGain"
                            placeholder="Gain Estimé"
                            value={functionalProjectData.estimatedGain}
                            onChange={handleChangeFunctionalData}
                          />
                        </div>
                        <div>
                          <label>Type de projet :</label>
                          <input
                            type="text"
                            name="projectType"
                            placeholder="Type de projet"
                            value={functionalProjectData.projectType}
                            onChange={handleChangeFunctionalData}
                          />
                        </div>
                        <div>
                          <label>Ressources nécessaires :</label>
                          <input
                            type="number"
                            name="resourcesRequired"
                            placeholder="Ressources nécessaires"
                            value={functionalProjectData.resourcesRequired}
                            onChange={handleChangeFunctionalData}
                          />
                        </div>
                        <div>
                          <label>Date de début :</label>
                          <input
                            type="date"
                            name="startDate"
                            value={functionalProjectData.startDate}
                            onChange={handleChangeFunctionalData}
                          />
                        </div>
                        <div>
                          <label>Date de fin :</label>
                          <input
                            type="date"
                            name="endDate"
                            value={functionalProjectData.endDate}
                            onChange={handleChangeFunctionalData}
                          />
                        </div>
                        <div>
                          <label>Statut :</label>
                          <select
                            name="status"
                            value={functionalProjectData.status}
                            onChange={handleChangeFunctionalData}
                          >
                            <option value="En cours">En cours</option>
                            <option value="Terminé">Terminé</option>
                            <option value="Null">Null</option>
                          </select>
                        </div>
                        <button type="submit">Ajouter Projet Fonctionnel</button>
                      </form>
                    </div>
                  </td>
                </tr>
              )}
              {/* Affichage des projets fonctionnels pour la ligne */}
              {row.functionalProjects && row.functionalProjects.length > 0 && (
                <tr>
                  <td colSpan="10">
                    <div className="project-under-row">
                      <h4>Projets Fonctionnels</h4>
                      <table className="functional-project-table">
                        <thead>
                          <tr>
                            <th>Nom</th>
                            <th>Gain Estimé</th>
                            <th>Type de projet</th>
                            <th>Ressources nécessaires</th>
                            <th>Date de début</th>
                            <th>Date de fin</th>
                            <th>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {row.functionalProjects.map((fp, index) => (
                            <tr key={index}>
                              <td>{fp.name}</td>
                              <td>{fp.estimatedGain}</td>
                              <td>{fp.projectType}</td>
                              <td>{fp.resourcesRequired}</td>
                              <td>{fp.startDate}</td>
                              <td>{fp.endDate}</td>
                              <td>{fp.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
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
