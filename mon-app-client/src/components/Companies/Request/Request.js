import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const Requests = () => {
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const location = useLocation();
  const user = location.state && location.state.user;

  useEffect(() => {
    fetchPendingCompanies();
  }, [user]); // Mise à jour lorsque l'utilisateur change

  const fetchPendingCompanies = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/pending-companies-true');
      // Filtrer les entreprises en attente de validation pour l'utilisateur courant
      const userPendingCompanies = response.data.filter(company => 
        company.userId === user.userId && company.pendingValidation
      );
      setPendingCompanies(userPendingCompanies);
      console.log(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises en attente de validation :', error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('http://localhost:3001/api/pending-companies', {
        companyName,
        description,
        userId: user.userId, // Utiliser l'ID de l'utilisateur actuel
        category,
        pendingValidation: true,
      });
      setCompanyName('');
      setDescription('');
      setCategory('professional');
      setLoading(false);
      fetchPendingCompanies();
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire :', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h3>Ajouter une nouvelle entreprise</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nom de la société"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
          <textarea
            placeholder="Description de la société"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="professional">Édition Professional</option>
            <option value="team">Édition Team</option>
            <option value="basic">Édition Basic</option>
            <option value="addon">Module supplémentaire</option>
          </select>
          <button type="submit" disabled={loading}>
            {loading ? 'Envoi en cours...' : 'Ajouter'}
          </button>
        </form>
      </div>

      <div>
        <h3>Entreprises en attente de validation</h3>
        {pendingCompanies.map((company, index) => (
          <div key={index}>
            <h4>{company.companyName}</h4>
            <p>{company.description}</p>
            <p>Catégorie : {company.category}</p>
            <p>Créateur : {company.userId}</p>
            <hr />
          </div>
        ))}
        {pendingCompanies.length === 0 && <p>Aucune entreprise en attente de validation pour le moment.</p>}
      </div>
    </div>
  );
};

export default Requests;
