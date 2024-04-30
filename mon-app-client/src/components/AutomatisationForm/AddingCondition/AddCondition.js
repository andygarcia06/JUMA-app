import React, { useState } from 'react';

import './AddCondition.css';


function AddCondition(props) {
    const [condition1, setCondition1] = useState('');
    const [condition2, setCondition2] = useState('');
    const [condition3, setCondition3] = useState('');

    const handleSubmit = () => {
        const newOptions = [condition1, condition2, condition3];
        props.onUpdateOptionsOnly(newOptions);
    };

    return (
        <div className='add-condition-block'>
            <input 
                type="text" 
                value={condition1} 
                onChange={(e) => setCondition1(e.target.value)}
                placeholder="Condition pour le premier select"
            />
            <input 
                type="text" 
                value={condition2} 
                onChange={(e) => setCondition2(e.target.value)}
                placeholder="Condition pour le deuxième select"
            />
            <input 
                type="text" 
                value={condition3} 
                onChange={(e) => setCondition3(e.target.value)}
                placeholder="Condition pour le troisième select"
            />
            <button onClick={handleSubmit}>Ajouter les Conditions</button>
        </div>
    );
}

export default AddCondition;
