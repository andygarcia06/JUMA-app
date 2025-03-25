import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style.css';

const TicketFields = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, organization, context = "default", programId, programName } = location.state || {};

  // Ticket initial, avec date en ISO pour Mongoose et utilisant le userId de l'utilisateur
  const [ticket, setTicket] = useState({
    detail: '',
    type: '',
    comments: '',
    rule: '',
    ticketNumber: '',
    title: '',
    organization: organization || '', // Organisation pré-remplie
    request: '',
    assigned: [], // Participants du programme ou membres de la compagnie
    subscribers: [], // Abonnés sélectionnables (multiple)
    markers: '',
    priority: '',
    creationDate: new Date().toISOString(), // Format ISO
    userId: user ? user.userId : '', // Utilisation de l'userId
    programName: programName || '', // Nom du programme
    programId: programId || '', // ID du programme
    status: 'mis en attente'
  });

  console.log("Données reçues dans TicketFields:", { user, organization, context, programId, programName });

  const [members, setMembers] = useState([]); // Membres récupérés via l'API
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // Pour afficher la popup de succès

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (context === "company") {
          // Récupérer toutes les compagnies
          const response = await axios.get('/api/all-companies');
          // Chercher la compagnie dont le companyName correspond exactement à l'organisation (insensible à la casse)
          const selectedCompany = response.data.find(company => 
            company.companyName.toLowerCase() === organization.toLowerCase()
          );
          if (selectedCompany) {
            console.log("[TicketFields] Membres récupérés pour l'organisation", organization, ":", selectedCompany.members);
            setMembers(selectedCompany.members || []);
            setTicket(prevTicket => ({
              ...prevTicket,
              assigned: selectedCompany.members.map(member => member.userId)
            }));
          } else {
            console.warn(`[SERVER] ⚠️ Entreprise non trouvée pour le nom: "${organization}"`);
          }
        } else if (context === "program" && programId) {
          // Route dédiée pour les participants d'un programme
          const response = await axios.get(`/api/company/${organization}/program/${programId}/participants`);
          console.log("[TicketFields] Participants récupérés pour le programme", programId, "de l'organisation", organization, ":", response.data);
          setMembers(response.data || []);
          setTicket(prevTicket => ({
            ...prevTicket,
            assigned: response.data.map(participant => participant.userId),
            programName: programName || '',
            programId: programId || ''
          }));
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des membres:', error);
      }
    };

    fetchData();
  }, [context, organization, programId, programName]);

  // Gestion du changement du champ Subscribers (sélection multiple)
  const handleSubscriberChange = (e) => {
    const selectedSubscribers = Array.from(e.target.selectedOptions, option => option.value);
    setTicket({ ...ticket, subscribers: selectedSubscribers });
  };

  const handleFieldChange = (field, value) => {
    setTicket({ ...ticket, [field]: value });
  };

  const handleSubmit = () => {
    // Vérifier les champs obligatoires : title, subscribers, creationDate, status
    if (!ticket.title.trim() || ticket.subscribers.length === 0 || !ticket.creationDate || !ticket.status.trim()) {
      alert("Veuillez remplir tous les champs obligatoires: Titre, Abonnés, Date de création et Statut.");
      return;
    }

    const ticketData = {
      user,
      ticket: {
        ...ticket,
        userId: user ? user.userId : ''
      }
    };

    axios.post('/api/tickets', ticketData)
      .then(response => {
        console.log('Ticket ajouté:', response.data);
        setShowSuccessPopup(true);
      })
      .catch(error => {
        console.error('Erreur lors de l\'ajout du ticket:', error);
      });
  };

  // Fermer la popup et revenir à la page précédente
  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    navigate(-1);
  };

  return (
    <div className="popup-overlay">
      <div className="ticket-popup">
        <div className="ticket-fields ticket-section" id="ticket-fields">
          <h3>Création de Ticket</h3>
          <div className="ticket-field">
            <label>Nom du Ticket <span className="required">*</span></label>
            <input
              type="text"
              value={ticket.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
            />
          </div>
          <div className="ticket-field">
            <label>Détail</label>
            <textarea
              value={ticket.detail}
              onChange={(e) => handleFieldChange('detail', e.target.value)}
            />
          </div>
          <div className="ticket-field">
            <label>Type</label>
            <input
              type="text"
              value={ticket.type}
              onChange={(e) => handleFieldChange('type', e.target.value)}
            />
          </div>
          <div className="ticket-field">
            <label>Commentaires</label>
            <textarea
              value={ticket.comments}
              onChange={(e) => handleFieldChange('comments', e.target.value)}
            />
          </div>
          <div className="ticket-field">
            <label>Règle de Gestion</label>
            <textarea
              value={ticket.rule}
              onChange={(e) => handleFieldChange('rule', e.target.value)}
            />
          </div>
          <div className="ticket-field">
            <label>Organisation</label>
            <input
              type="text"
              value={ticket.organization}
              readOnly
            />
          </div>
          {context === "program" && (
            <>
              <div className="ticket-field">
                <label>Nom du Programme</label>
                <input
                  type="text"
                  value={ticket.programName}
                  readOnly
                />
              </div>
              <div className="ticket-field">
                <label>ID du Programme</label>
                <input
                  type="text"
                  value={ticket.programId}
                  readOnly
                />
              </div>
            </>
          )}
          <div className="ticket-field">
            <label>Assigné</label>
            <textarea
              value={members.map(member => member.email).join(', ')}
              readOnly
            />
          </div>
          <div className="ticket-field">
            <label>Abonnés <span className="required">*</span></label>
            <select
              multiple
              value={ticket.subscribers}
              onChange={handleSubscriberChange}
            >
              {members.map(member => (
                <option key={member.userId} value={member.userId}>
                  {member.email}
                </option>
              ))}
            </select>
          </div>
          <div className="ticket-field">
            <label>Demande</label>
            <input
              type="text"
              value={ticket.request}
              onChange={(e) => handleFieldChange('request', e.target.value)}
            />
          </div>
          <div className="ticket-field">
            <label>Marqueurs</label>
            <input
              type="text"
              value={ticket.markers}
              onChange={(e) => handleFieldChange('markers', e.target.value)}
            />
          </div>
          <div className="ticket-field">
            <label>Priorité</label>
            <input
              type="text"
              value={ticket.priority}
              onChange={(e) => handleFieldChange('priority', e.target.value)}
            />
          </div>
          <div className="ticket-field">
            <label>Date de Création</label>
            <input
              type="text"
              value={new Date(ticket.creationDate).toLocaleString()}
              readOnly
            />
          </div>
          <button onClick={handleSubmit}>Ajouter le Ticket</button>
        </div>
        {showSuccessPopup && (
          <div className="popup-success">
            <h3>Ticket créé avec succès !</h3>
            <button onClick={handleClosePopup}>Retour</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketFields;
