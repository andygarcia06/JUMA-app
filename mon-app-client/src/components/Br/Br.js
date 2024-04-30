import React from 'react';
import { useParams } from 'react-router-dom';

const BR = () => {
    const { br } = useParams();
    console.log(br)
    // Utilisez brId pour récupérer les données du BR, si nécessaire

    return (
      <div>
        <h2>Détails du BR</h2>
        {/* Afficher les détails du BR ici */}
      </div>
    );
};

export default BR;
