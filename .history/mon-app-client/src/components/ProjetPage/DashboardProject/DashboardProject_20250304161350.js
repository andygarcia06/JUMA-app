import React, { useState, useEffect } from 'react';
import Metrics from './Metrics/Metrics';
import ProjectTab from './ProjectTab/ProjectTab';
import './DashboardProject.css';
import axios from 'axios';

const DashboardProject = ({ companyId, userId, programId, projectId, programName, companyName }) => {
  const [projectTabs, setProjectTabs] = useState([]); // État pour les tabs
  const [showPopup, setShowPopup] = useState(false); // État pour gérer la popup
  const [newTabName, setNewTabName] = useState(''); // État pour stocker le nom de la nouvelle tab
  const [loading, setLoading] = useState(true); // État pour le chargement
  const [error, setError] = useState(null); // État pour gérer les erreurs

  useEffect(() => {
    const initializeHierarchy = async () => {
      try {
        const initPayload = {
          companyId,
          companyName,
          programId,
          programName,
          projectId,
          projectName: "Projet initial"  // Vous pouvez aussi le passer en prop
        };
        console.log("Appel à /initialize avec :", initPayload);
        const initResponse = await axios.post(`http://localhost:3001/initialize`, initPayload);
        console.log("Réponse d'initialisation :", initResponse.data);
      } catch (error) {
        console.error("Erreur lors de l'initialisation :", error);
      }
    };
  
    // Appel à l'initialisation puis chargement des tabs
    const fetchTabs = async () => {
      try {
        setLoading(true);
        await initializeHierarchy();
        const params = { companyId, programId };
        console.log("GET /projects/" + projectId + "/tabs avec params:", params);
        const response = await axios.get(`/projects/${projectId}/tabs`, { params });
        console.log("Réponse reçue pour GET tabs:", response.data);
        setProjectTabs(response.data.tabs);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des tabs :', err);
        setError('Impossible de récupérer les tabs. Veuillez réessayer.');
        setLoading(false);
      }
    };
  
    fetchTabs();
  }, [companyId, programId, projectId]);
  

  // Charger les tabs existantes depuis le back-end
  useEffect(() => {
    const fetchTabs = async () => {
      try {
        setLoading(true);
        const params = { companyId, programId };
        console.log("GET /projects/" + projectId + "/tabs avec params:", params);
        const response = await axios.get(`/projects/${projectId}/tabs`, { params });
        console.log("Réponse reçue pour GET tabs:", response.data);
        setProjectTabs(response.data.tabs); // Mettre à jour les tabs
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des tabs :', err);
        setError('Impossible de récupérer les tabs. Veuillez réessayer.');
        setLoading(false);
      }
    };

    fetchTabs(); // Charger les tabs au montage du composant
  }, [companyId, programId, projectId]);

  // Ouvrir/Fermer la popup
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  // Enregistrer la nouvelle tab côté back-end
  const saveNewTab = async (tab) => {
    const payload = {
      companyId,
      programId,
      projectId,
      tabId: tab.id,
      tabName: tab.name,
    };
    console.log("POST payload envoyé:", payload);
    try {
      const response = await axios.post(`http://localhost:3001/projects/${projectId}/tabs`, payload);
      console.log("Réponse POST reçue:", response.data);
      return response.data; // Retourner la réponse du serveur
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tab :", error);
      throw error;
    }
  };

  // Ajouter une nouvelle tab
// Ajouter une nouvelle tab
const handleAddTab = async () => {
  if (newTabName.trim() !== '') {
    const newTab = {
      tabId: `tab-${Date.now()}`, // Génère un ID unique avec la bonne clé
      tabName: newTabName,         // Utilise la bonne clé pour le nom
    };

    try {
      // Enregistrer la nouvelle tab côté back-end
      await saveNewTab(newTab);

      // Ajouter la nouvelle tab localement si la sauvegarde réussit
      setProjectTabs([...projectTabs, newTab]);
      setNewTabName(''); // Réinitialiser le champ de saisie
      togglePopup(); // Fermer la popup
    } catch (error) {
      console.error("Erreur lors de l'ajout de la tab :", error);
    }
  }
};


  return (
    <div className="dashboard-project">
      <h2>Dashboard : Budget du projet</h2>

      {/* Composant Metrics */}
      <Metrics
        companyId={companyId}
        userId={userId}
        programId={programId}
        projectId={projectId}
        programName={programName}
        companyName={companyName}
      />

      {/* Bouton pour ouvrir la popup */}
      <button onClick={togglePopup} className="add-tab-button">
        + Ajouter une tab
      </button>

      {/* Gestion du chargement et des erreurs */}
      {loading ? (
        <p>Chargement des tabs...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          {/* Afficher les tabs */}
          <h3>Liste des Tabs :</h3>
          {projectTabs.length > 0 ? (
            projectTabs.map((tab) => (
              <ProjectTab
                key={tab.tabId} // Assurez-vous que chaque tab a un tabId unique
                companyId={companyId}
                userId={userId}
                programId={programId}
                projectId={projectId}
                tabId={tab.tabId}  // Passer le tabId correct
                tabName={tab.tabName} // Passer le nom de la tab
              />
            ))
          ) : (
            <p>Aucune tab trouvée pour ce projet.</p>
          )}
        </>
      )}

      {/* Popup pour ajouter une nouvelle tab */}
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
              <button onClick={togglePopup}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardProject;
