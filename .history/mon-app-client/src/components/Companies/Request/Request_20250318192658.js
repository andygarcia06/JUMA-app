import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';


const Requests = () => {
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [pendingCompanies, setPendingCompanies] = useState([]);

  // États pour la recherche et la gestion des membres
  const [searchQuery, setSearchQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const location = useLocation();
  const user = location.state && location.state.user;

  useEffect(() => {
    if (user) {
      fetchPendingCompanies();
    }
  }, [user]);

  const fetchPendingCompanies = async () => {
    try {
      const response = await axios.get('/api/pending-companies-true');
      const userPendingCompanies = response.data.filter(company => 
        company.userId === user.pseudo && company.pendingValidation
      );
      setPendingCompanies(userPendingCompanies);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises en attente de validation :', error);
    }
  };

  const searchUsers = async (query) => {
    try {
      const response = await axios.get(`/api/users/search?query=${query}`);
      setUserResults(response.data);
    } catch (error) {
      console.error('Erreur lors de la recherche d’utilisateurs :', error);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 1) {
      searchUsers(query);
    } else {
      setUserResults([]);
    }
  };

  // Ajout de membres avec évitement des doublons
  const handleAddMember = (member) => {
    const formattedMember = {
      userId: member.username,
      email: member.email,
      pseudo: member.pseudo
    };
    if (!selectedMembers.some(m => m.userId === formattedMember.userId)) {
      setSelectedMembers(prev => [...prev, formattedMember]);
    }
    setSearchQuery('');
    setUserResults([]);
  };

  const handleRemoveMember = (userId) => {
    setSelectedMembers(prev => prev.filter(m => m.userId !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      console.log("🚀 Envoi de la requête de création d'entreprise...");
      console.log("📦 Données envoyées :", {
        companyName,
        description,
        userId: user.pseudo,
        category,
        pendingValidation: true,
        members: selectedMembers
      });
  
      const companyResponse = await axios.post('/api/pending-companies', {
        companyName,
        description,
        userId: user.pseudo,
        category,
        pendingValidation: true,
        members: selectedMembers
      });
  
      console.log("✅ Nouvelle entreprise créée :", companyResponse.data);
  
      setCompanyName('');
      setDescription('');
      setCategory('professional');
      setSelectedMembers([]);
      setLoading(false);
      fetchPendingCompanies();
    } catch (error) {
      console.error('❌ Erreur lors de la soumission du formulaire :', error.response ? error.response.data : error);
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
          
          {/* Barre de recherche des membres */}
          <div>
            <input
              type="text"
              placeholder="Rechercher des membres..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {userResults.length > 0 && (
              <ul>
                {userResults.map((member) => (
                  <li key={member._id} onClick={() => handleAddMember(member)}>
                    {member.email} ({member.pseudo})
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Liste des membres sélectionnés */}
          {selectedMembers.length > 0 && (
            <div>
              <h4>Membres ajoutés :</h4>
              <ul>
                {selectedMembers.map((member) => (
                  <li key={member.userId}>
                    {member.email} ({member.pseudo})
                    <button onClick={() => handleRemoveMember(member.userId)}>X</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Envoi en cours...' : 'Ajouter'}
          </button>
        </form>
      </div>

      <div>
        <h3>Entreprises en attente de validation</h3>
        {pendingCompanies.length === 0 ? (
          <p>Aucune entreprise en attente de validation pour le moment.</p>
        ) : (
          pendingCompanies.map((company, index) => (
            <div key={index}>
              <h4>{company.companyName}</h4>
              <p>{company.description}</p>
              <p>Catégorie : {company.category}</p>
              <p>Créateur : {company.userId}</p>
              {company.members && company.members.length > 0 && (
                <ul>
                  {company.members.map(member => (
                    <li key={member.userId}>{member.email} ({member.userId})</li>
                  ))}
                </ul>
              )}
              <hr />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Requests;
