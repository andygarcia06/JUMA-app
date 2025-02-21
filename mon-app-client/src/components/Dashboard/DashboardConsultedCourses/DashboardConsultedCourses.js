import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DashboardConsultedCourses({ user }) {
  const [consultedCourses, setConsultedCourses] = useState([]);

  useEffect(() => {
    if (!user || !user.userId) return;

    axios.get(`/api/dashboard-consulted-courses/${user.userId}`)
      .then(response => {
        setConsultedCourses(response.data.consultedCourses || []);
      })
      .catch(error => {
        console.error('Erreur fetch consulted-courses :', error);
      });
  }, [user]);

  return (
    <div>
      <h3>Courses auxquels j’ai réagi</h3>
      {consultedCourses.length === 0 ? (
        <p>Aucun cours consulté/réagi.</p>
      ) : (
        <ul>
          {consultedCourses.map((course) => (
            <li key={course.courseId}>
              {course.courseTitle} (Module: {course.moduleTitle})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DashboardConsultedCourses;
