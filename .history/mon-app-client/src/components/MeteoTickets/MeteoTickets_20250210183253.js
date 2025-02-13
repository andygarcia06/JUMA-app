import React, { useEffect, useState } from 'react';

const MeteoTickets = ({ assignedTickets }) => {
  const [globalMeteo, setGlobalMeteo] = useState("🌫 Indéterminée");
  const [totalTickets, setTotalTickets] = useState(0);

  useEffect(() => {
    if (!assignedTickets || assignedTickets.length === 0) {
      setGlobalMeteo("🌫 Indéterminée");
      setTotalTickets(0);
      return;
    }

    let meteoScores = { positif: 0, neutre: 0, negatif: 0 };
    let total = assignedTickets.length;

    assignedTickets.forEach(ticket => {
      if (ticket.meteo === "☀️ Positive") meteoScores.positif++;
      else if (ticket.meteo === "🌤 Neutre") meteoScores.neutre++;
      else if (ticket.meteo === "🌧 Négative") meteoScores.negatif++;
    });

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
  }, [assignedTickets]);

  return (
    <div className="meteo-summary">
      <h4>🌡 Météo Globale des Tickets Assignés</h4>
      <p>Total Tickets Assignés : <strong>{totalTickets}</strong></p>
      <p>Météo Générale : <strong>{globalMeteo}</strong></p>
    </div>
  );
};

export default MeteoTickets;
