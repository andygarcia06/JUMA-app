import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TicketCreator = ({user}) => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Données de l'utilisateur dans TicketCreator:", user);
  }, [user]);


  const handleButtonClick = () => {
    navigate('/ticket-fields', { state: { user } });
  };

  return (
    <div className="ticket-creator">
      <button onClick={handleButtonClick}>Ajouter un ticket</button>
    </div>
  );
};

export default TicketCreator;
