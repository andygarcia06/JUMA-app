import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TicketCreator = ({ user, organization, context = "default", programId, programName }) => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Données dans TicketCreator:", { user, organization, context, programId, programName });
  }, [user, organization, context, programId, programName]);

  const handleButtonClick = () => {
    navigate('/ticket-fields', { 
      state: { 
        user, 
        organization, 
        context, 
        programId: context === "program" ? programId : undefined, // Ajoutez programId si contexte "program"
        programName: context === "program" ? programName : undefined // Ajoutez programName si contexte "program"
      } 
    });
  };

  return (
    <div className="ticket-creator">
      <button onClick={handleButtonClick}>Ajouter un ticket</button>
    </div>
  );
};

export default TicketCreator;
