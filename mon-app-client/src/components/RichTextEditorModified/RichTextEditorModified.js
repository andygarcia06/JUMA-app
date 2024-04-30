import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditorModified = ({ initialContent, onSave }) => {
  const [content, setContent] = useState(initialContent);

  const handleChange = (value) => {
    setContent(value);
  };

  const handleSave = () => {
    onSave(content); // Appeler la fonction onSave avec le contenu mis à jour
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

export default RichTextEditorModified;
