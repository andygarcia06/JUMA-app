import React, { useState, useEffect } from 'react';
import SatisfactionHeader from './SatisfactionHeader/SatisfactionHeader';
import SatisfactionConditions from './SatisfactionConditions/SatisfactionConditions';
import SatisfactionConditionsList from './SatisfactionConditionList/SatisfactionConditionList';


function SatisfactionNote({ selectedTicket }) {
  console.log("Ticket sélectionné dans SatisfactionNote :", selectedTicket);

    return (
      <div>
        <SatisfactionHeader />
        <SatisfactionConditions selectedTicket={selectedTicket}/>
        <SatisfactionConditionsList selectedTicket={selectedTicket}/>
      </div>
    );
  }
  
  export default SatisfactionNote;