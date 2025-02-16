import React, { useState } from "react";
import axios from "axios";
import "./DBEnrichmentTicket.css"; // Ajoute ce fichier CSS pour le style

const DBEnrichmentTicket = () => {
  const [text, setText] = useState(""); // Zone de texte
  const [category, setCategory] = useState("neutre"); // Sélecteur déroulant
  const [message, setMessage] = useState(""); // Message de confirmation

  // ✅ Envoyer l'entrée à la base de données JSON
  const handleSubmit = async () => {
    if (!text.trim()) {
      setMessage("⚠️ Veuillez entrer un texte avant d'envoyer !");
      return;
    }

    try {
      const response = await axios.post("/api/enrich-db", {
        text,
        category,
      });

      if (response.data.success) {
        setMessage("✅ Entrée ajoutée avec succès !");
        setText(""); // Réinitialise le champ
      } else {
        setMessage("❌ Erreur lors de l'ajout !");
      }
    } catch (error) {
      console.error("Erreur API:", error);
      setMessage("❌ Erreur de connexion au serveur.");
    }
  };

  return (
    <div className="db-enrichment-container">
      <h2>📌 Enrichissement de la BDD</h2>

      {/* ✅ Zone de texte avec emojis */}
      <textarea
        className="db-text-input"
        placeholder="Ajoutez du texte, des emojis, des symboles..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* ✅ Sélecteur de catégorie */}
      <select
        className="db-category-select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="positif">👍 Positif</option>
        <option value="neutre">😐 Neutre</option>
        <option value="negatif">👎 Négatif</option>
      </select>

      {/* ✅ Bouton Envoyer */}
      <button className="db-submit-button" onClick={handleSubmit}>
        Envoyer
      </button>

      {/* ✅ Message de confirmation */}
      {message && <p className="db-message">{message}</p>}
    </div>
  );
};

export default DBEnrichmentTicket;
