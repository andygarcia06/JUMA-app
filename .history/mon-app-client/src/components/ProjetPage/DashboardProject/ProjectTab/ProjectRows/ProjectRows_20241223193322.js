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

  // Fonction pour gérer les changements dans le formulaire du projet fonctionnel
  const handleChangeFunctionalData = (e) => {
    const { name, value } = e.target;
    setFunctionalProjectData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Fonction pour soumettre le projet fonctionnel
  const handleSubmitFunctionalProject = async (e) => {
    e.preventDefault();
    try {
      // Vérifiez que rowId et projectId sont bien définis
      const response = await axios.post(`http://localhost:3001/projects/${projectId}/functional`, {
        rowId: selectedRowId,  // Ajoutez la rowId pour associer le projet fonctionnel à la ligne
        ...functionalProjectData
      });
      console.log('Projet fonctionnel ajouté:', response.data);

      // Mise à jour du projet fonctionnel pour la ligne sélectionnée
      setRows((prevRows) => {
        return prevRows.map((row) => {
          if (row.rowId === selectedRowId) {
            return {
              ...row,
              functionalProject: response.data // Ajouter le projet fonctionnel à la ligne
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
      setSelectedRowId(null);  // Ou vous pouvez garder la ligne ouverte si nécessaire
    } catch (error) {
      console.error('Erreur lors de l\'ajout du projet fonctionnel:', error);
    }
  };

  const handleStatusChange = async (rowId, newStatus) => {
    // Mettre à jour l'état local en changeant le statut de la ligne
    const updatedRows = rows.map((row) =>
      row.rowId === rowId ? { ...row, status: newStatus } : row
    );
    setRows(updatedRows);  // Mettre à jour l'état des lignes avec la nouvelle valeur de statut
  
    // Envoyer la modification au serveur
    try {
      const rowToUpdate = updatedRows.find((row) => row.rowId === rowId);
      await axios.put(`http://localhost:3001/tabs/${tabId}/rows/${rowId}`, {
        ...rowToUpdate,  // Nous envoyons les nouvelles données de la ligne avec le nouveau statut
        status: newStatus,
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut :', error);
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
              {/* Affichage du projet fonctionnel sous la ligne */}
              {row.functionalProject && (
                            <tr>
              <td colSpan="10">
                <div className="project-under-row">
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
                      <tr>
                        <td>{row.functionalProject.name}</td>
                        <td>{row.functionalProject.estimatedGain}</td>
                        <td>{row.functionalProject.projectType}</td>
                        <td>{row.functionalProject.resourcesRequired}</td>
                        <td>{row.functionalProject.startDate}</td>
                        <td>{row.functionalProject.endDate}</td>
                        <td>{row.functionalProject.status}</td>
                      </tr>
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
