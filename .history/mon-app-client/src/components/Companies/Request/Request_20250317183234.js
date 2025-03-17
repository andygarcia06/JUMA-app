import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const Requests = () => {
  // États pour la création d'une entreprise
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  
  // États pour la recherche de membres
  const [searchQuery, setSearchQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const location = useLocation();
  // On suppose que l'objet user est transmis via location.state
  const user = location.state && location.state.user;

  useEffect(() => {
    if (user) {
      fetchPendingCompanies();
    }
  }, [user]); // Mise à jour lorsque l'utilisateur change

  const fetchPendingCompanies = async () => {
    try {
      const response = await axios.get('/api/pending-companies-true');
      // On filtre en comparant company.userId avec user.pseudo (car pour l'utilisateur "1", user.pseudo vaut "1")
      const userPendingCompanies = response.data.filter(company => 
        company.userId === user.pseudo && company.pendingValidation
      );
      setPendingCompanies(userPendingCompanies);
      console.log("Response from API:", response.data);
      console.log("Filtered companies:", userPendingCompanies);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises en attente de validation :', error);
    }
  };

  // Fonction de recherche des utilisateurs dans la BDD via votre endpoint de recherche
  const searchUsers = async (query) => {
    try {
      // L'endpoint doit renvoyer un tableau d'utilisateurs filtré selon la query
      const response = await axios.get(`/api/users/search?query=${query}`);
      setUserResults(response.data);
    } catch (error) {
      console.error('Erreur lors de la recherche d’utilisateurs :', error);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if(query.length > 1) {
      searchUsers(query);
    } else {
      setUserResults([]);
    }
  };

  // Correction : Utiliser l'identifiant unique _id pour vérifier les doublons
  const handleAddMember = (member) => {
    if (!selectedMembers.some(m => m._id === member._id)) {
      setSelectedMembers(prev => [...prev, member]);
    }
    // Effacer la recherche
    setSearchQuery('');
    setUserResults([]);
  };

  const handleRemoveMember = (memberId) => {
    setSelectedMembers(prev => prev.filter(m => m._id !== memberId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Soumission de la nouvelle entreprise avec les membres ajoutés
      await axios.post('/api/pending-companies', {
        companyName,
        description,
        // On utilise user.pseudo pour être cohérent avec la BDD
        userId: user.pseudo,
        category,
        pendingValidation: true,
        members: selectedMembers  // On envoie le tableau des membres sélectionnés
      });
      setCompanyName('');
      setDescription('');
      setCategory('professional');
      setSelectedMembers([]);
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
          {/* Barre de recherche pour ajouter des membres */}
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
          {/* Affichage des membres sélectionnés */}
          {selectedMembers.length > 0 && (
            <div>
              <h4>Membres ajoutés :</h4>
              <ul>
                {selectedMembers.map((member) => (
                  <li key={member._id}>
                    {member.email} ({member.pseudo})
                    <button onClick={() => handleRemoveMember(member._id)}>X</button>
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
