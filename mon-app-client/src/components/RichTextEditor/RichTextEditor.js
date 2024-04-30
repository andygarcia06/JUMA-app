import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const RichTextEditor = ({ onContentChange }) => {
  const [content, setContent] = useState('');

  const handleChange = (value) => {
    setContent(value);
    // Appeler la fonction de rappel avec le contenu mis à jour
    onContentChange(value);
  };

  const handleSave = async () => {
    try {
      // Envoie du contenu enrichi au backend
      const response = await axios.post('http://example.com/api/save', {
        content: content
      });
      console.log('Contenu sauvegardé avec succès:', response.data);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du contenu:', error);
    }
  };

  return (
    <div>
      <ReactQuill
        value={content}
        onChange={handleChange}
        modules={{
          toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link'],
            ['clean']
          ],
        }}
      />
      <button onClick={handleSave}>Enregistrer</button>
    </div>
  );
};

export default RichTextEditor;