import React, { useState, useEffect } from 'react';
import './NewKnowledgeItem.css';
import RichTextEditor from '../RichTextEditor/RichTextEditor';

const NewKnowledgeItem = ({ onClose, onNewModule, onNewCourse, modules, user }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [title, setTitle] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [description, setDescription] = useState('');
  const [editorContent, setEditorContent] = useState('');

  const searchModules = (term) => {
    if (term.trim() === '') {
      setSearchResults([]);
      return;
    }
    const filteredModules = modules.filter(module => module.title.toLowerCase().includes(term.toLowerCase()));
    setSearchResults(filteredModules);
  };

  const handleEditorChange = (content) => {
    setEditorContent(content);
  };

  useEffect(() => {
    searchModules(searchTerm);
  }, [searchTerm, modules]);

  const assignModule = (moduleId) => {
    setModuleId(moduleId);
    setSearchTerm('');
  };

  const handleNewModule = () => {
    if (title.trim() !== '') {
      const newModule = {
        title: title,
        createdAt: new Date(),
        creator: 'User', // Remplacer 'User' par l'utilisateur réel
      };
      onNewModule(newModule);
    } else {
      alert('Veuillez remplir le titre du module.');
    }
  };

  const handleNewCourse = () => {
    if (title.trim() !== '' && moduleId.trim() !== '' && editorContent.trim() !== '') {
      const newCourse = {
        title: title,
        moduleName: moduleId,
        description: description, // Utilisation de la description
        content: editorContent,
        createdAt: new Date(),
        creator: user,
      };
      onNewCourse(newCourse);
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  };

  return (
    <div className="popup-container">
      <div className="popup">
        <h2>Que voulez-vous créer ?</h2>
        <button onClick={() => setSelectedOption('module')}>Créer un nouveau module</button>
        <button onClick={() => setSelectedOption('course')}>Créer un nouveau cours</button>

        {selectedOption === 'module' && (
          <div>
            <input
              type="text"
              placeholder="Titre du module"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button onClick={handleNewModule}>Créer le module</button>
          </div>
        )}

        {selectedOption === 'course' && (
          <div>
            <input
              type="text"
              placeholder="Titre du cours"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Rechercher un nom de module"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchResults.map(module => (
              <div key={module.id} onClick={() => assignModule(module.id)}>{module.title}</div>
            ))}
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <RichTextEditor onContentChange={handleEditorChange} />
            <button onClick={handleNewCourse}>Créer le cours</button>
          </div>
        )}

        <button onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
};

export default NewKnowledgeItem;
