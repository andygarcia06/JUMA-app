import React, { useState, useEffect } from 'react';
import axios from 'axios';

import './styles.css';

function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState('');
  const maxResultsToShow = 2;
  const [noOccurrencesFound, setNoOccurrencesFound] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNomArticle, setNewNomArticle] = useState('');
  const [newContenuArticle, setNewContenuArticle] = useState('');
  const [resultsToShow, setResultsToShow] = useState(maxResultsToShow);

  function highlightOccurrences(text, searchTerm) {
    const searchTermLowerCase = searchTerm.toLowerCase();
    const regex = new RegExp(searchTermLowerCase.split('').map(char => `.*${char}`).join(''), 'gi');
  
    return text.replace(regex, (match) => {
      return `<span class="highlight">${match}</span>`;
    });
  }

  const performSearch = async (term) => {
    try {
      const searchTermLowerCase = term.toLowerCase();

      if (searchTermLowerCase.length >= 2) {
        const response = await axios.post('/recherche', { searchTerm: searchTermLowerCase });
        const searchResults = response.data;

        let totalOccurrences = 0;

        const searchResultsWithOccurrences = searchResults.map((result) => {
          result.nom_article = highlightOccurrences(result.nom_article, searchTermLowerCase);
          result.contenu_article = highlightOccurrences(result.contenu_article, searchTermLowerCase);

          const nomArticleOccurrences = (result.nom_article.match(/<span class="highlight">/g) || []).length;
          const contenuArticleOccurrences = (result.contenu_article.match(/<span class="highlight">/g) || []).length;

          totalOccurrences += nomArticleOccurrences + contenuArticleOccurrences;

          return {
            ...result,
            occurrences: nomArticleOccurrences + contenuArticleOccurrences,
          };
        });

        if (totalOccurrences > 0) {
          setMessage(`Trouvé ${totalOccurrences} occurrence(s) de "${searchTerm}".`);
          setNoOccurrencesFound(false);
        } else {
          setMessage(`Aucune occurrence de "${searchTerm}" trouvée.`);
          setNoOccurrencesFound(true);
        }

        setResults(searchResultsWithOccurrences);
      } else {
        setResults([]);
        setMessage('');
        setNoOccurrencesFound(false);
      }

      setResultsToShow(maxResultsToShow);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      performSearch(searchTerm);
    }
  }, [searchTerm]);

  const handleAddArticle = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/ajouter', {
        nom_article: newNomArticle,
        contenu_article: newContenuArticle,
      });

      setNewNomArticle('');
      setNewContenuArticle('');
      setShowAddForm(false);
      setSearchTerm('');
      performSearch('');

      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const showMoreResults = () => {
    setResultsToShow(resultsToShow + maxResultsToShow);
  };

  const closeAddForm = () => {
    setShowAddForm(false);
  };

  return (
    <div>
      <input
        className='input-search'
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={() => performSearch(searchTerm)}>Rechercher</button>
      <div className='side-result'>
        <p>{message}</p>
        <ul>
          {results.slice(0, resultsToShow).map((result, index) => (
            <li key={index}>
              <p>
                <span
                  className="result-name"
                  dangerouslySetInnerHTML={{
                    __html: result.nom_article,
                  }}
                />
                -{' '}
                <span
                  className="result-content"
                  dangerouslySetInnerHTML={{
                    __html: result.contenu_article,
                  }}
                />
              </p>
            </li>
          ))}
        </ul>
        {resultsToShow < results.length && (
          <button onClick={showMoreResults}>Afficher plus</button>
        )}
      </div>
      {noOccurrencesFound && (
        <div>
          <button onClick={() => setShowAddForm(true)}>+</button>
          {showAddForm && (
            <form onSubmit={handleAddArticle} className='form-add-result'>
              <input
                type="text"
                placeholder="Nom de l'article"
                value={newNomArticle}
                onChange={(e) => setNewNomArticle(e.target.value)}
              />
              <input
                type="text"
                placeholder="Contenu de l'article"
                value={newContenuArticle}
                onChange={(e) => setNewContenuArticle(e.target.value)}
              />
              <button type="submit">Ajouter</button>
              <button onClick={closeAddForm}>Fermer</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchPage;
