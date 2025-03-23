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
    const filteredModules = modules.filter(module =>
      module.title.toLowerCase().includes(term.toLowerCase())
    );
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
        creator: user // On peut envoyer l'objet user complet
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
        moduleId: moduleId,  // Utilisation du moduleId pour l'association
        description: description,
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
        <div className="popup-header">
          <h2>Que voulez-vous créer ?</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="popup-content">
          <div className="options">
            <button className="option-btn" onClick={() => setSelectedOption('module')}>
              Créer un nouveau module
            </button>
            <button className="option-btn" onClick={() => setSelectedOption('course')}>
              Créer un nouveau cours
            </button>
          </div>
          {selectedOption === 'module' && (
            <div className="form-container">
              <input
                type="text"
                placeholder="Titre du module"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <button className="action-btn" onClick={handleNewModule}>
                Créer le module
              </button>
            </div>
          )}
          {selectedOption === 'course' && (
            <div className="form-container">
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
                <div
                  key={module.id}
                  className="module-search-result"
                  onClick={() => assignModule(module.id)}
                >
                  {module.title}
                </div>
              ))}
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <RichTextEditor onContentChange={handleEditorChange} />
              <button className="action-btn" onClick={handleNewCourse}>
                Créer le cours
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewKnowledgeItem;
