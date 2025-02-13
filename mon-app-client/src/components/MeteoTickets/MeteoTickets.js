import React, { useEffect, useState } from 'react';

const MeteoTickets = ({ assignedTickets }) => {
  const [globalMeteo, setGlobalMeteo] = useState("🌫 Indéterminée");
  const [totalTickets, setTotalTickets] = useState(0);
  const [averageValidationTime, setAverageValidationTime] = useState(null); // Ajout de l'état pour stocker le temps moyen

  useEffect(() => {
    if (!assignedTickets || assignedTickets.length === 0) {
      setGlobalMeteo("🌫 Indéterminée");
      setTotalTickets(0);
      setAverageValidationTime(null);
      return;
    }

    let meteoScores = { positif: 0, neutre: 0, negatif: 0 };
    let total = assignedTickets.length;
    let totalTime = 0; // Pour stocker la somme des temps entre création et validation
    let validTicketsCount = 0; // Pour compter les tickets validés

    assignedTickets.forEach(ticket => {
      if (ticket.meteo === "☀️ Positive") meteoScores.positif++;
      else if (ticket.meteo === "🌤 Neutre") meteoScores.neutre++;
      else if (ticket.meteo === "🌧 Négative") meteoScores.negatif++;

      // Vérifier si le ticket a une date de validation
      if (ticket.validationDate) {
        const creationDate = new Date(ticket.creationDate.split('/').reverse().join('-')); // Format JJ/MM/AAAA → AAAA-MM-JJ
        const validationDate = new Date(ticket.validationDate);
        
        const timeDiff = validationDate - creationDate; // Différence en millisecondes
        totalTime += timeDiff;
        validTicketsCount++;
      }
    });

    // Calculer la météo dominante
    const dominantMeteo = Object.keys(meteoScores).reduce((a, b) =>
      meteoScores[a] > meteoScores[b] ? a : b
    );

    let meteoEmoji;
    switch (dominantMeteo) {
      case "positif":
        meteoEmoji = "🟢 Positive";
        break;
      case "neutre":
        meteoEmoji = "🟡 Neutre";
        break;
      case "negatif":
        meteoEmoji = "🔴 Négative";
        break;
      default:
        meteoEmoji = "🌫 Indéterminée";
    }

    setGlobalMeteo(meteoEmoji);
    setTotalTickets(total);

    // Calculer le temps moyen si des tickets sont validés
    if (validTicketsCount > 0) {
      const avgTimeInDays = totalTime / validTicketsCount / (1000 * 60 * 60 * 24); // Convertir en jours
      setAverageValidationTime(avgTimeInDays.toFixed(1)); // Arrondi à 1 décimale
    } else {
      setAverageValidationTime(null);
    }
  }, [assignedTickets]);

  return (
    <div className="meteo-summary">
      <h4>🌡 Météo Globale des Tickets Assignés</h4>
      <p>Total Tickets Assignés : <strong>{totalTickets}</strong></p>
      <p>Météo Générale : <strong>{globalMeteo}</strong></p>
      {averageValidationTime !== null && (
        <p>⏳ Temps moyen de validation : <strong>{averageValidationTime} jours</strong></p>
      )}
    </div>
  );
};

export default MeteoTickets;
