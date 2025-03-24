import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';
import TicketMessagerie from './TicketMessagerie/TicketMessagerie';

const TicketEntry = () => {
  const { ticketId } = useParams();
  const location = useLocation();
  const { userId } = location.state || {};  // Récupérer le userId depuis le state

  const [ticketDetails, setTicketDetails] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    console.log(`Ticket ID dans TicketEntry: ${ticketId}, User ID: ${userId}`);

    // Récupérer les détails du ticket
    axios.get(`/api/tickets/${ticketId}`)
      .then(response => {
        setTicketDetails(response.data);
      })
      .catch(error => console.error('Erreur lors de la récupération des détails du ticket:', error));

    // Récupérer les messages du ticket
    axios.get(`/api/messages/${ticketId}`)
      .then(response => {
        setMessages(response.data);
      })
      .catch(error => console.error('Erreur lors de la récupération des messages du ticket:', error));
  }, [ticketId, userId]);

  return (
    <div className='ticket-entry-container'>
      <div className="ticket-details">
        <h3>Détails du Ticket</h3>
        {ticketDetails ? (
          <div>
            <p><strong>Titre:</strong> {ticketDetails.title}</p>
            <p><strong>Description:</strong> {ticketDetails.detail}</p>
            <p><strong>Priorité:</strong> {ticketDetails.priority}</p>
          </div>
        ) : <p>Chargement des détails...</p>}
      </div>

      {/* Passez correctement le ticketId et userId à TicketMessagerie */}
      <TicketMessagerie ticketId={ticketId} userId={userId} messages={messages} />
    </div>
  );
};

export default TicketEntry;
