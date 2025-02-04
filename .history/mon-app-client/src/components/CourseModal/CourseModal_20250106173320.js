import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RichTextEditorModified from '../RichTextEditorModified/RichTextEditorModified';
import ReactionButtons from '../ReactionButtons/ReactionButtons';

const CourseModal = ({ course, onClose, user, moduleId }) => {
  const [showEditor, setShowEditor] = useState(false);
  const [editedContent, setEditedContent] = useState(course.content);
  const [courseId, setCourseId] = useState('');
  const [modificationCount, setModificationCount] = useState(0);

  useEffect(() => {
    if (course) {
      setCourseId(course.id);
      setEditedContent(course.content); // Mettre à jour le contenu édité lorsque le cours change
    }
  }, [course]);

  const handleConsultCourse = async () => {
    if (!course || !user) return;

    try {
      const response = await axios.post('http://localhost:3001/api/log-course-view', {
        courseId: course.id,
        userId: user.userId
      });
      console.log(response.data);
    } catch (error) {
      console.error('Erreur lors de la consultation du cours :', error);
    }
  };

  const handleEditCourse = () => {
    setShowEditor(true);
  };

  const handleSaveCourse = async (content) => {
    try {
      // Mise à jour du contenu édité
      setEditedContent(content);
      console.log('Contenu modifié :', content);

      // Masquer l'éditeur
      setShowEditor(false);

      // Incrémenter le nombre de modifications
      const newModificationCount = modificationCount + 1;
      setModificationCount(newModificationCount);
      console.log('Nouveau nombre de modifications :', newModificationCount);

      // Mettre à jour le nombre de modifications de l'utilisateur
      await axios.post(`http://localhost:3001/api/user/${user.userId}/update-modification-count`, {
        modificationCount: newModificationCount
      });

      // Envoyer une requête pour mettre à jour le contenu du cours
      await axios.put(`http://localhost:3001/api/modules/${moduleId}/courses/${courseId}`, {
        content: content
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cours :', error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h3 className="course-title">{course.title}</h3>
        <div className="course-container">
          {showEditor ? (
            <RichTextEditorModified courseId={courseId} initialContent={editedContent} onSave={handleSaveCourse} />
          ) : (
            <div className="course-content" dangerouslySetInnerHTML={{ __html: editedContent }}></div>
          )}
        </div>
        {!showEditor && (
          <button className="course-button validate-button" onClick={handleConsultCourse}>Valider le cours</button>
        )}
        {!showEditor && (
          <button className="course-button edit-button" onClick={handleEditCourse}>Modifier le cours</button>
        )}
        <div className="reaction-buttons-container">
          <ReactionButtons userId={user.userId} moduleId={moduleId} courseId={course.id} />
        </div>
      </div>
    </div>
  );
};

export default CourseModal;
