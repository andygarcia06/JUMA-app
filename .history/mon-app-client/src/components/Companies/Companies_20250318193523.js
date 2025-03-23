import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SubscriptionCurrent from '../Companies/SubscriptionCurrent/SubscriptionCurrent';
import Requests from '../Companies/Request/Request';
import BackButton from '../BackButton/BackButton'

const Companies = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Essayer de récupérer user depuis location.state ou localStorage
  const [user, setUser] = useState(() => {
    if (location.state && location.state.user) {
      return location.state.user;
    }
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Enregistrer user dans localStorage et rediriger si absent
  useEffect(() => {
    if (!user) {
      // Si l'utilisateur n'est pas présent, rediriger vers la connexion
      navigate('/login');
    } else {
      localStorage.setItem('user', JSON.stringify(user));
      console.log("Données de l'utilisateur dans Companies :", user._id || user.userId);
    }
  }, [user, navigate]);

  const [currentTab, setCurrentTab] = useState('subscription'); // Pour suivre l'onglet actif

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  return (
    <div>
    <BackButton />s
      {/* Onglets */}
      <div>
        <button onClick={() => handleTabChange('subscription')}>
          Abonnement actuel
        </button>
        <button onClick={() => handleTabChange('requests')}>
          Demandes
        </button>
      </div>

      {/* Contenu en fonction de l'onglet sélectionné */}
      {currentTab === 'subscription' && <SubscriptionCurrent />}
      {currentTab === 'requests' && <Requests userId={user?.userId} />}
    </div>
  );
};

export default Companies;
