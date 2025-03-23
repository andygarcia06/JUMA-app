import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProjectTab from './ProjectTab/ProjectTab';
import './DashboardProject.css';

const DashboardProject = ({ companyId, userId, programId, projectId, programName, companyName }) => {
  const [projectTabs, setProjectTabs] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction d'initialisation et de récupération des tabs
  useEffect(() => {
    const initializeAndFetchTabs = async () => {
      try {
        // Appel d'initialisation pour s'assurer que la hiérarchie existe
        const initPayload = {
          companyId,
          companyName,
          programId,
          programName,
          projectId,
          projectName: "Projet initial" // Vous pouvez passer un nom différent si nécessaire
        };
        console.log("Appel à /initialize avec :", initPayload);
        await axios.post(`/initialize`, initPayload);

        // Ensuite, récupération des tabs
        const params = { companyId, programId };
        console.log(`GET /projects/${projectId}/tabs avec params:`, params);
        const response = await axios.get(`/projects/${projectId}/tabs`, { params });
        console.log("Réponse reçue pour GET tabs:", response.data);
        setProjectTabs(response.data.tabs || []);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des tabs :', err);
        setError('Impossible de récupérer les tabs. Veuillez réessayer.');
        setLoading(false);
      }
    };

    if (companyId && programId && projectId && tabId) {
      initializeAndFetchTabs();
    }
  }, [companyId, programId, projectId, tabId]);

  // Fonction pour enregistrer une nouvelle tab côté serveur
  const saveNewTab = async (tab) => {
    const payload = {
      companyId,
      companyName,
      programId,
      programName,
      projectId,
      tabId: tab.tabId,
      tabName: tab.tabName
    };
    console.log("POST payload envoyé:", payload);
    const response = await axios.post(`/projects/${projectId}/tabs`, payload);
    console.log("Réponse POST reçue:", response.data);
    return response.data;
  };

  const handleAddTab = async () => {
    if (newTabName.trim() !== '') {
      const newTab = {
        tabId: `tab-${Date.now()}`, // Génère un ID unique
        tabName: newTabName,
      };

      try {
        await saveNewTab(newTab);
        setProjectTabs([...projectTabs, newTab]);
        setNewTabName('');
        setShowPopup(false);
      } catch (error) {
        console.error("Erreur lors de l'ajout de la tab :", error);
      }
    }
  };

  return (
    <div className="dashboard-project">
      <h2>Dashboard : Budget du projet</h2>

      {loading ? (
        <p>Chargement des tabs...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <h3>Liste des Tabs :</h3>
          {projectTabs.length > 0 ? (
            projectTabs.map((tab) => (
              <ProjectTab
                key={tab.tabId}
                companyId={companyId}
                userId={userId}
                programId={programId}
                projectId={projectId}
                tabId={tab.tabId}
                tabName={tab.tabName}
              />
            ))
          ) : (
            <p>Aucune tab trouvée pour ce projet.</p>
          )}
        </>
      )}

      <button onClick={() => setShowPopup(true)} className="add-tab-button">
        + Ajouter une tab
      </button>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Créer une nouvelle tab</h3>
            <input
              type="text"
              placeholder="Nom de la tab"
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
            />
            <div className="popup-buttons">
              <button onClick={handleAddTab}>Créer</button>
              <button onClick={() => setShowPopup(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardProject;
