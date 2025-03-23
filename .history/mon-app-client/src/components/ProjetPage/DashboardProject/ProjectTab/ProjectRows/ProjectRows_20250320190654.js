import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProjectRows.css';
import { FaRegCommentDots } from 'react-icons/fa';

const ProjectRows = ({ companyId, programId, projectId, tabId }) => {
  const [rows, setRows] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [newRowData, setNewRowData] = useState({
    rowId: '',
    rowName: '',
    owner: '',
    goal: '',
    priority: 'Basse',
    type: '',
    budget: 0,
    actual: 0,
    status: 'En cours'
  });
  const [functionalProjectData, setFunctionalProjectData] = useState({
    name: '',
    estimatedGain: '',
    projectType: '',
    resourcesRequired: '',
    startDate: '',
    endDate: '',
    status: 'En cours'
  });

  // Récupération des rows depuis le serveur pour le tab donné
  useEffect(() => {
    const fetchRows = async () => {
      try {
        const response = await axios.get(`/tabs/${tabId}/rows`, {
          params: { companyId, programId, projectId }
        });
        console.log("Rows fetched:", response.data.rows);
        setRows(response.data.rows || []);
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des rows:', error);
      }
    };

    if (tabId && companyId && programId && projectId) {
      fetchRows();
    }
  }, [tabId, companyId, programId, projectId]);

  // Gestion des changements dans le formulaire de la nouvelle row
  const handleNewRowChange = (e) => {
    const { name, value } = e.target;
    setNewRowData(prev => ({ ...prev, [name]: value }));
  };

  // Soumission du formulaire pour ajouter une nouvelle row
  const handleAddRow = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        companyId,
        programId,
        projectId,
        tabId,
        rowId: newRowData.rowId || `row-${Date.now()}`,
        rowName: newRowData.rowName,
        owner: newRowData.owner,
        goal: newRowData.goal,
        priority: newRowData.priority,
        type: newRowData.type,
        budget: Number(newRowData.budget),
        actual: Number(newRowData.actual),
        status: newRowData.status
      };
      console.log("🚀 Envoi du payload pour nouvelle row :", payload);
      const response = await axios.post(`/tabs/${tabId}/rows`, payload);
      console.log("✅ Nouvelle row ajoutée :", response.data);
      setRows(prevRows => [...prevRows, response.data.row]);
      setNewRowData({
        rowId: '',
        rowName: '',
        owner: '',
        goal: '',
        priority: 'Basse',
        type: '',
        budget: 0,
        actual: 0,
        status: 'En cours'
      });
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout de la row:", error);
    }
  };

  // Gestion des changements dans le formulaire du projet fonctionnel
  const handleChangeFunctionalData = (e) => {
    const { name, value } = e.target;
    setFunctionalProjectData(prev => ({ ...prev, [name]: value }));
  };

  // Soumission du formulaire pour ajouter un projet fonctionnel à une row
  const handleSubmitFunctionalProject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        companyId,
        programId,
        projectId,
        tabId,
        rowId: selectedRowId,
        functionalProject: functionalProjectData
      };
      console.log("🚀 Envoi du payload pour projet fonctionnel :", payload);
      const response = await axios.post(`/projects/${projectId}/functional`, payload);
      console.log("✅ Projet fonctionnel ajouté :", response.data);
      setRows(prevRows =>
        prevRows.map(row =>
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
      console.error("❌ Erreur lors de l'ajout du projet fonctionnel:", error);
    }
  };

  // Gestion du changement de statut d'une row
  const handleStatusChange = async (rowId, newStatus) => {
    const updatedRows = rows.map(row =>
      row.rowId === rowId ? { ...row, status: newStatus } : row
    );
    setRows(updatedRows);
    try {
      const rowToUpdate = updatedRows.find(row => row.rowId === rowId);
      await axios.put(`/tabs/${tabId}/rows/${rowId}`, { ...rowToUpdate, status: newStatus });
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du statut :", error);
    }
  };

  // Toggle pour afficher/cacher le formulaire de projet fonctionnel pour une row donnée
  const handleOpenUnderRow = (rowId) => {
    setSelectedRowId(selectedRowId === rowId ? null : rowId);
  };

  // Calcul des sommes
  const totalBudget = rows.reduce((acc, row) => acc + (row.budget || 0), 0);
  const totalActual = rows.reduce((acc, row) => acc + (row.actual || 0), 0);
  const totalRemainingBudget = rows.reduce((acc, row) => acc + (row.remainingBudget || 0), 0);

  return (
    <div>
      {/* Formulaire pour ajouter une nouvelle row */}
      <div className="add-row-form">
        <h3>Ajouter une nouvelle Row</h3>
        <form onSubmit={handleAddRow}>
          <div>
            <label>Nom de la row :</label>
            <input
              type="text"
              name="rowName"
              value={newRowData.rowName}
              onChange={handleNewRowChange}
              required
            />
          </div>
          <div>
            <label>Propriétaire :</label>
            <input
              type="text"
              name="owner"
              value={newRowData.owner}
              onChange={handleNewRowChange}
              required
            />
          </div>
          <div>
            <label>Objectif :</label>
            <input
              type="text"
              name="goal"
              value={newRowData.goal}
              onChange={handleNewRowChange}
              required
            />
          </div>
          <div>
            <label>Priorité :</label>
            <select name="priority" value={newRowData.priority} onChange={handleNewRowChange}>
              <option value="Basse">Basse</option>
              <option value="Moyen">Moyen</option>
              <option value="Élevé">Élevé</option>
            </select>
          </div>
          <div>
            <label>Type :</label>
            <input
              type="text"
              name="type"
              value={newRowData.type}
              onChange={handleNewRowChange}
              required
            />
          </div>
          <div>
            <label>Budget :</label>
            <input
              type="number"
              name="budget"
              value={newRowData.budget}
              onChange={handleNewRowChange}
              required
            />
          </div>
          <div>
            <label>Réel :</label>
            <input
              type="number"
              name="actual"
              value={newRowData.actual}
              onChange={handleNewRowChange}
              required
            />
          </div>
          <div>
            <label>Statut :</label>
            <select name="status" value={newRowData.status} onChange={handleNewRowChange}>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
              <option value="Null">Null</option>
            </select>
          </div>
          <button type="submit">Ajouter Row</button>
        </form>
      </div>

      {/* Affichage des rows */}
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
          {rows.map(row => (
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
                <td>
                  <select
                    value={row.status}
                    onChange={(e) => handleStatusChange(row.rowId, e.target.value)}
                    style={{
                      border: 'none',
                      borderRadius: '5px',
                      padding: '5px',
                      width: '100px',
                      backgroundColor:
                        row.status === 'Terminé'
                          ? 'green'
                          : row.status === 'En cours'
                          ? 'yellow'
                          : 'gray',
                      color: row.status === 'Terminé' ? 'white' : 'black'
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

              {/* Formulaire pour ajouter un projet fonctionnel à la row sélectionnée */}
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

              {/* Affichage des projets fonctionnels existants */}
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
