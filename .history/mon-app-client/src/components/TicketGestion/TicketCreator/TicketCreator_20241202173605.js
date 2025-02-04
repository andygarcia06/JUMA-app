import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TicketCreator = ({user,organization}) => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Données dans TicketCreator:", { user, organization });
  }, [user, organization]);

  const handleButtonClick = () => {
    navigate('/ticket-fields', { state: { user, organization } });
  };

  return (
    <div className="ticket-creator">
      <button onClick={handleButtonClick}>Ajouter un ticket</button>
    </div>
  );
};

export default TicketCreator;
