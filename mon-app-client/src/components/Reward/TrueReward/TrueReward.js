import React, { useState } from 'react';
import AllSubMenus from '../AllSubMenus/AllSubMenus';
import './TrueReward.css';

const TrueReward = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSections, setFilteredSections] = useState([]);

  // Fonction pour gérer le changement dans le champ de recherche
  const handleSearchChange = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    // Filtrer les sections basées sur le terme de recherche
    const filtered = allSections.filter(section =>
      section.title.toLowerCase().includes(term)
    );
    setFilteredSections(filtered);
  };

  // Définir toutes les sections avec leur titre et contenu
  const allSections = [
    { id: 'bon-achat', title: 'Bon d\'achat', content: 'Contenu de la section Bon d\'achat' },
    { id: 'cinema', title: 'Cinéma', content: 'Contenu de la section Cinéma' },
    { id: 'culture', title: 'Culture', content: 'Contenu de la section Culture' },
    { id: 'loisirs', title: 'Loisirs', content: 'Contenu de la section Loisirs' },
    { id: 'spectacles', title: 'Spectacles et événements', content: 'Contenu de la section Spectacles et événements' },
    { id: 'bons-plans', title: 'Bons plans', content: 'Contenu de la section Bons plans' },
    { id: 'voyages', title: 'Voyages', content: 'Contenu de la section Voyages' },
    { id: 'parfums', title: 'Parfums', content: 'Contenu de la section Parfums' },
    { id: 'dons', title: 'Dons', content: 'Contenu de la section Dons' },
  ];

  return (
    <div>
      {/* Bannière avec image de la société */}
      <div className="company-banner">
        <img
          src="https://example.com/company-banner.jpg"
          alt="Company Banner"
        />
      </div>

      {/* Champ de recherche */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Sous-menus */}
      <AllSubMenus />

      {/* Afficher les sections filtrées ou toutes les sections */}
      {filteredSections.length > 0 ? (
        filteredSections.map(section => (
          <section key={section.id} id={section.id}>
            <h3>{section.title}</h3>
            <p>{section.content}</p>
            {/* Afficher les cartes de la section */}
            <div className="card-container">
              {[1, 2, 3, 4, 5].map(index => (
                <div key={index} className="card">
                  <p>Carte {index}</p>
                </div>
              ))}
            </div>
          </section>
        ))
      ) : (
        allSections.map(section => (
          <section key={section.id} id={section.id}>
            <h3>{section.title}</h3>
            <p>{section.content}</p>
            {/* Afficher les cartes de la section */}
            <div className="card-container">
              {[1, 2, 3, 4, 5].map(index => (
                <div key={index} className="card">
                  <p>Carte {index}</p>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
};

export default TrueReward;
