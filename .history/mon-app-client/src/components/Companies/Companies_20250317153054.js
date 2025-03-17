import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SubscriptionCurrent from '../Companies/SubscriptionCurrent/SubscriptionCurrent';
import Requests from '../Companies/Request/Request';

const Companies = () => {
    const location = useLocation();
  const [currentTab, setCurrentTab] = useState('subscription'); // État pour suivre l'onglet actuel
  const user = location.state && location.state.user;
  console.log("Données de l'utilisateur:", user);

  useEffect(() => {
    console.log("Données de l'utilisateur dans Companies :", user._id);
  }, [user]);

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  return (
    <div>
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
      {currentTab === 'requests' && <Requests userId={user.userId}/>}
    </div>
  );
};

export default Companies;
