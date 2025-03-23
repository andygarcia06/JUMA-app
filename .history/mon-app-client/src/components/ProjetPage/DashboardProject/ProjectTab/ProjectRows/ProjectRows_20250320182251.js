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

  useEffect(() => {
    const fetchRows = async () => {
      try {
        const response = await axios.get(`/tabs/${tabId}/rows`, {
          params: { companyId, programId, projectId }
        });
        setRows(response.data.rows || []);
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des rows:', error);
      }
    };

    fetchRows();
  }, [tabId, companyId, programId, projectId]);

  const handleChangeFunctionalData = (e) => {
    const { name, value } = e.target;
    setFunctionalProjectData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

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

      setRows(prevRows => prevRows.map(row => 
        row.rowId === selectedRowId
          ? { ...row, functionalProjects: [...(row.functionalProjects || []), response.data.functionalProject] }
          : row
      ));

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

  return (
    <div>
      <table className="project-rows-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Propriétaire</th>
            <th>Objectif</th>
            <th>Budget</th>
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
                <td>{row.budget}</td>
                <td>{row.status}</td>
                <td>
                  <FaRegCommentDots 
                    style={{ cursor: 'pointer', fontSize: '20px' }} 
                    onClick={() => setSelectedRowId(row.rowId === selectedRowId ? null : row.rowId)} 
                  />
                </td>
              </tr>
              {selectedRowId === row.rowId && (
                <tr>
                  <td colSpan="6">
                    <form onSubmit={handleSubmitFunctionalProject}>
                      <h4>Ajouter un Projet Fonctionnel</h4>
                      <input type="text" name="name" placeholder="Nom du projet" value={functionalProjectData.name} onChange={handleChangeFunctionalData} />
                      <input type="number" name="estimatedGain" placeholder="Gain Estimé" value={functionalProjectData.estimatedGain} onChange={handleChangeFunctionalData} />
                      <button type="submit">Ajouter</button>
                    </form>
                  </td>
                </tr>
              )}
              {row.functionalProjects?.length > 0 && (
                <tr>
                  <td colSpan="6">
                    <h4>Projets Fonctionnels</h4>
                    <ul>
                      {row.functionalProjects.map((project, index) => (
                        <li key={index}>{project.name} - {project.estimatedGain}€</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectRows;
