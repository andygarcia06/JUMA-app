import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProjectRows.css';  // Assurez-vous d'avoir un fichier CSS pour les couleurs
import { FaRegCommentDots } from 'react-icons/fa';  // Icône de dialogue

const ProjectRows = ({ companyId, programId, projectId, tabId }) => {
  const [rows, setRows] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(null);  // Ajouter un état pour la ligne sélectionnée
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
        const response = await axios.get(`http://localhost:3001/tabs/${tabId}/rows`, {
          params: { companyId, programId, projectId }
        });
        setRows(response.data.rows || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des rows:', error);
      }
    };
    fetchRows();
  }, [tabId, companyId, programId, projectId]);

  // Fonction pour récupérer les projets fonctionnels associés à une ligne
  const fetchFunctionalProjects = async (rowId) => {
    try {
      const response = await axios.get(`http://localhost:3001/projects/${projectId}/functional/${rowId}`);
      const functionalProjects = response.data.functionalProjects || [];
      return functionalProjects;
    } catch (error) {
      console.error('Erreur lors de la récupération des projets fonctionnels:', error);
      return [];
    }
  };

  const handleChangeFunctionalData = (e) => {
    const { name, value } = e.target;  // Extraire le nom du champ et sa valeur
    setFunctionalProjectData((prevData) => ({
      ...prevData,
      [name]: value  // Mettre à jour le champ spécifique du formulaire
    }));
  };

  // Fonction pour ajouter un projet fonctionnel
  const handleSubmitFunctionalProject = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:3001/projects/${projectId}/functional`, {
        rowId: selectedRowId,
        ...functionalProjectData
      });
      console.log('Projet fonctionnel ajouté:', response.data);

      // Mettre à jour la ligne avec le nouveau projet fonctionnel
      setRows((prevRows) => {
        return prevRows.map((row) => {
          if (row.rowId === selectedRowId) {
            return {
              ...row,
              functionalProjects: [...(row.functionalProjects || []), response.data] // Ajouter sans écraser les autres projets
            };
          }
          return row;
        });
      });

      // Réinitialiser les données du formulaire
      setFunctionalProjectData({
        name: '',
        estimatedGain: '',
        projectType: '',
        resourcesRequired: '',
        startDate: '',
        endDate: '',
        status: 'En cours'
      });

      // Fermer la sous-ligne après ajout
      setSelectedRowId(null);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du projet fonctionnel:', error);
    }
  };

  // Fonction pour afficher ou masquer la ligne sous chaque ligne (click sur l'icône)
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
                            value={functionalProjectData.name}
                            onChange={handleChangeFunctionalData}
                          />
                        </div>
                        <div>
                          <label>Gain Estimé :</label>
                          <input
                            type="number"
                            name="estimatedGain"
                            value={functionalProjectData.estimatedGain}
                            onChange={handleChangeFunctionalData}
                          />
                        </div>
                        <div>
                          <label>Type de projet :</label>
                          <input
                            type="text"
                            name="projectType"
                            value={functionalProjectData.projectType}
                            onChange={handleChangeFunctionalData}
                          />
                        </div>
                        <div>
                          <label>Ressources nécessaires :</label>
                          <input
                            type="number"
                            name="resourcesRequired"
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

              {/* Affichage des projets fonctionnels sous la ligne sélectionnée */}
              {selectedRowId === row.rowId && row.functionalProjects && (
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
                          {row.functionalProjects.map((functionalProject, index) => (
                            <tr key={index}>
                              <td>{functionalProject.name}</td>
                              <td>{functionalProject.estimatedGain}</td>
                              <td>{functionalProject.projectType}</td>
                              <td>{functionalProject.resourcesRequired}</td>
                              <td>{functionalProject.startDate}</td>
                              <td>{functionalProject.endDate}</td>
                              <td>{functionalProject.status}</td>
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
