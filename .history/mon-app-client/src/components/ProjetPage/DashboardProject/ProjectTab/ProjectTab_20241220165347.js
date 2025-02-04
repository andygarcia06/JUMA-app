import React, { useState } from 'react';
import './ProjectTab.css';
import axios from 'axios';

const ProjectTab = ({ companyId, userId, programId, projectId, programName, companyName, tabId }) => {
  const [showPopup, setShowPopup] = useState(false); // État pour la popup
  const [newRow, setNewRow] = useState({
    rowName: '',
    owner: userId,
    goal: '',
    priority: 'Moyen',
    type: '',
    budget: 0,
    actual: 0,
    remainingBudget: 0,
    status: 'En cours',
  });

  // Ouvrir/Fermer la popup
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  // Gérer les changements dans les champs
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si budget ou réel change, mettre à jour le budget restant
    if (name === 'budget' || name === 'actual') {
      setNewRow((prevRow) => ({
        ...prevRow,
        [name]: value,
        remainingBudget: name === 'budget'
          ? value - prevRow.actual
          : prevRow.budget - value,
      }));
    } else {
      setNewRow((prevRow) => ({
        ...prevRow,
        [name]: value,
      }));
    }
  };

  // Soumettre la nouvelle row
  const handleSubmit = async () => {
    try {
      // Appeler une API pour ajouter la row dans le back-end
      await axios.post(`http://localhost:3001/tabs/${tabId}/rows`, {
        companyId,
        programId,
        projectId,
        tabId,
        newRow,
      });

      // Réinitialiser la popup et fermer
      setNewRow({
        rowName: '',
        owner: userId,
        goal: '',
        priority: 'Moyen',
        type: '',
        budget: 0,
        actual: 0,
        remainingBudget: 0,
        status: 'En cours',
      });
      togglePopup();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la row :', error);
    }
  };

  return (
    <div className="project-tab">
      <h3>ProjectTab pour {projectId}</h3>

      {/* Bouton pour ajouter une row */}
      <button onClick={togglePopup} className="add-row-button">
        + Ajouter une row
      </button>

      {/* Popup */}
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
                Propriétaire :
                <input
                  type="text"
                  name="owner"
                  value={newRow.owner}
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
              <button onClick={handleSubmit}>Ajouter</button>
              <button onClick={togglePopup}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTab;
