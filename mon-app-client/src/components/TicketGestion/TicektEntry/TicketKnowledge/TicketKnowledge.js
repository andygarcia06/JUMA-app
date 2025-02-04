import React from 'react';

const TicketKnowledge = ({ suggestions, onSelectCourse }) => {
  // Vérifier si suggestions est un tableau
  if (!suggestions || !Array.isArray(suggestions)) {
    return <div>Aucune suggestion disponible.</div>;
  }

  return (
    <div className="ticket-knowledge">
      <h4>Suggestions de la base de connaissances :</h4>
      <ul>
        {suggestions.map((suggestion, index) => {
          const title = suggestion.title || 'Module';
          const description = suggestion.description || suggestion.content || 'Pas de description';
          
          return (
            <li key={index} onClick={() => onSelectCourse(suggestion)}>
              {/* Afficher le titre et la description ou contenu selon la structure des deux fichiers */}
              {title} - {description}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TicketKnowledge;
