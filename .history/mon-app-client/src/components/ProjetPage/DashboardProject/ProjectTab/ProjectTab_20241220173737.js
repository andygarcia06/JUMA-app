import React, { useState, useEffect } from 'react';
import './ProjectTab.css';
import axios from 'axios';

const ProjectTab = ({ companyId, programId, projectId, tabId, tabName, userId }) => {
  const [rows, setRows] = useState([]); // État pour les rows
  const [isExpanded, setIsExpanded] = useState(false); // État pour gérer l'expansion de la tab
  const [showPopup, setShowPopup] = useState(false); // État pour la popup d'ajout de row
  const [newRow, setNewRow] = useState({
    rowName: '',
    owner: userId, // Propriétaire par défaut correspondant au userId
    goal: '',
    priority: 'Moyen',
    type: '',
    budget: 0,
    actual: 0,
    remainingBudget: 0,
    status: 'En cours',
  });

  // Charger les rows associées à la tab depuis le back-end
  useEffect(() => {
    console.log(tabId)
    if (isExpanded) {
      const fetchRows = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/tabs/${tabId}/rows`);
          setRows(response.data.rows || []); // Mettre à jour les rows
        } catch (error) {
          console.error('Erreur lors de la récupération des rows :', error);
        }
      };

      fetchRows(); // Charger les rows lorsque la tab est étendue
    }
  }, [isExpanded, tabId]);

  // Ouvrir/Fermer la popup
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  // Gérer les changements dans les champs de la popup
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si budget ou réel change, mettre à jour le budget restant
    if (name === 'budget' || name === 'actual') {
      setNewRow((prevRow) => ({
        ...prevRow,
        [name]: Number(value),
        remainingBudget: name === 'budget'
          ? Number(value) - prevRow.actual
          : prevRow.budget - Number(value),
      }));
    } else {
      setNewRow((prevRow) => ({
        ...prevRow,
        [name]: value,
      }));
    }
  };

  const handleAddRow = async () => {
    // Vérification du champ 'type'
    if (!newRow.type.trim()) {
      newRow.type = 'Non spécifié';  // Valeur par défaut si 'type' est vide
    }
  
    // Vérification que tous les champs nécessaires sont remplis
    if (!newRow.rowName.trim() || !newRow.goal.trim() || !newRow.priority.trim() || !newRow.type.trim() || newRow.budget === undefined || newRow.actual === undefined || !newRow.status.trim()) {
      console.error('Erreur: Tous les champs doivent être remplis');
      return;
    }
  
    // Calculer le budget restant (éviter les valeurs négatives)
    const calculatedRemainingBudget = newRow.budget - newRow.actual;
    const validRemainingBudget = calculatedRemainingBudget >= 0 ? calculatedRemainingBudget : 0; // Remplacer par 0 si négatif
  
    const payload = {
      ...newRow,
      remainingBudget: validRemainingBudget,  // Utiliser la valeur validée de remainingBudget
      tabId,
      tabName,
      projectId,
      programId,
      companyId,
      userId
    };
  
    console.log('Données envoyées pour ajouter une row:', payload);  // Vérifiez les données envoyées
  
    try {
      const response = await axios.post(`http://localhost:3001/tabs/${tabId}/rows`, payload);
      setRows([...rows, response.data.row]);
      togglePopup(); // Fermer la popup
      setNewRow({
        rowName: '',
        owner: userId,
        goal: '',
        priority: 'Moyen',
        type: 'Non spécifié',
        budget: 0,
        actual: 0,
        remainingBudget: 0,
        status: 'En cours',
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la row :', error);
    }
  };
  
  
  
  

  return (
    <div className="project-tab">
      {/* En-tête de la tab */}
      <div className="tab-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="arrow">{isExpanded ? '🔽' : '▶️'}</span>
        <span className="tab-name">{tabName}</span>
        <button onClick={togglePopup} className="add-row-button">
          +
        </button>
      </div>

      {/* Contenu de la tab (rows) */}
      {isExpanded && (
        <div className="tab-content">
          {rows.length > 0 ? (
            <table className="rows-table">
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
                    <td className={`priority-${row.priority.toLowerCase()}`}>{row.priority}</td>
                    <td>{row.type}</td>
                    <td>{row.budget}</td>
                    <td>{row.actual}</td>
                    <td>{row.remainingBudget}</td>
                    <td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Aucune row trouvée dans cette tab.</p>
          )}
        </div>
      )}

      {/* Popup pour ajouter une row */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Ajouter une Row</h3>
            <form>
              <label>
                Nom de la row :
                <input
                  type="text"
                  name="rowName"
                  value={newRow.rowName}
                  onChange={handleChange}
                />
              </label>
              <label>
                Objectif :
                <input
                  type="text"
                  name="goal"
                  value={newRow.goal}
                  onChange={handleChange}
                />
              </label>
              <label>
                Priorité :
                <select
                  name="priority"
                  value={newRow.priority}
                  onChange={handleChange}
                >
                  <option value="Élevé">Élevé</option>
                  <option value="Moyen">Moyen</option>
                  <option value="Basse">Basse</option>
                </select>
              </label>
              <label>
                Type :
                <input
                  type="text"
                  name="type"
                  value={newRow.type}
                  onChange={handleChange}
                />
              </label>
              <label>
                Budget :
                <input
                  type="number"
                  name="budget"
                  value={newRow.budget}
                  onChange={handleChange}
                />
              </label>
              <label>
                Réel :
                <input
                  type="number"
                  name="actual"
                  value={newRow.actual}
                  onChange={handleChange}
                />
              </label>
              <label>
                Budget restant :
                <input
                  type="number"
                  name="remainingBudget"
                  value={newRow.remainingBudget}
                  disabled
                />
              </label>
              <label>
                Statut :
                <select
                  name="status"
                  value={newRow.status}
                  onChange={handleChange}
                >
                  <option value="En cours">En cours</option>
                  <option value="Terminé">Terminé</option>
                  <option value="Null">Null</option>
                </select>
              </label>
            </form>
            <div className="popup-buttons">
              <button onClick={handleAddRow}>Ajouter</button>
              <button onClick={togglePopup}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTab;
