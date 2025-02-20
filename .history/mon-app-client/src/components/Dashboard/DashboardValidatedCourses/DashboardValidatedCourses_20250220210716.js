import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DashboardValidatedCourses({ user }) {
  const [validatedCourses, setValidatedCourses] = useState([]);

  useEffect(() => {
    if (!user || !user.userId) return;

    axios.get(`/api/dashboard-validated-courses/${user.userId}`)
      .then(response => {
        setValidatedCourses(response.data.validatedCourses || []);
      })
      .catch(error => {
        console.error('Erreur fetch validated-courses :', error);
      });
  }, [user]);

  return (
    <div>
      <h3>Mes Cours Validés</h3>
      {validatedCourses.length === 0 ? (
        <p>Vous n’avez validé aucun cours pour l’instant.</p>
      ) : (
        <ul>
          {validatedCourses.map((courseId, index) => (
            <li key={index}>{courseId}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DashboardValidatedCourses;
