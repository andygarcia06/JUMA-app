import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const PhaseListItem = ({ phase }) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const tileClassName = ({ date }) => {
    const startDate = new Date(phase.startDate);
    const endDate = new Date(phase.endDate);

    if (date >= startDate && date <= endDate) {
      return 'highlighted-date';
    }

    return '';
  };

  return (
    <li className="phase-item" key={phase.id}>
      <p className="phase-name">Nom de la phase : {phase.phaseName}</p>
      <p className="phase-dates">Date de début : {phase.startDate}</p>
      <p className="phase-dates">Date de fin : {phase.endDate}</p>
      <button onClick={toggleCalendar}>Voir le calendrier</button>

      {showCalendar && (
        <div className="phase-calendar">
          <Calendar
            value={[new Date(phase.startDate), new Date(phase.endDate)]}
            tileClassName={tileClassName}
          />
        </div>
      )}
    </li>
  );
};

export default PhaseListItem;
