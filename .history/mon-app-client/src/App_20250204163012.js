import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';


import store from './redux/store'; // Assurez-vous que le chemin vers store.js est correct

import LoginPage from './components/LoginPage/LoginPage';
import LoginAdminPage from './components/LoginAdminPage/LoginAdminPage';
import AdminDashboardLogin from './components/AdminDashboardLogin/AdminDashboardLogin';
import DashboardAdmin from './components/DashboardAdmin/DashboardAdmin';
import UpgradeUser from './components/UpgradeUser/UpgradeUser';


import SearchPage from './components/SearchPage/searchpage';
import SignUpPage from './components/SignUp/SignUp';
import Dashboard from './components/Dashboard/Dashboard';
import AutomatisationForm from './components/AutomatisationForm/AutomatisationForm';
import HomePage from './components/HomePage/HomePage';
import Reward from './components/Reward/Reward';
import TrueReward from './components/Reward/TrueReward/TrueReward';
import KnowledgeManagement from './components/KnowledgeManagement/KnowledgeManagement';
import Companies from './components/Companies/Companies';
import ValidationCompanies from './components/ValidationCompanies/ValidationCompanies';

import ProjectManagement from './components/ProjectManagement/ProjectManagement';
import Company from './components/Company/Company';
import ProgramDetails from './components/Programs/ProgramDetail/ProgramDetail'; // Supposons que vous avez un composant ProgramDetails pour afficher les détails du programme
import ProjetPage from './components/ProjetPage/ProjetPage';
import LotPage from './components/LotPage.js/LotPage';
import BR from './components/Br/Br'

import TicketFields from './components/TicketGestion/TicketField/TicketsFields';
import DashboardTickets from './components/DashboardTickets/DashboardTickets';
import TicketEntry from './components/TicketGestion/TicektEntry/TicketEntry';






function App() {
  return (
    <Provider store={store}>
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin-dashboard-login" element={<AdminDashboardLogin />} />
          <Route path="/dashboard-admin" element={<DashboardAdmin />} />
          <Route path="/upgrade-user" element={<UpgradeUser />} />



          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-login" element={<LoginAdminPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/automatisation" element={<AutomatisationForm />} />
          <Route path="/rewards" element={<Reward />} />
          <Route path="/true-reward" element={<TrueReward />} />
          <Route path="/knowledge-management" element={<KnowledgeManagement />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/validation-companies" element={<ValidationCompanies />} />
          <Route path="/gestion-de-projets" element={<ProjectManagement />} />
          <Route path="/company/:companyId" element={<Company />} />
          <Route path="/program/:id" element={<ProgramDetails />} />
          <Route path="/projet/:projectId" element={<ProjetPage />} />
          <Route path="/lotPage/:id" element={<LotPage />} />
          <Route path="/br/:id" element={<BR />} />
          <Route path='/ticket-fields' element={<TicketFields/>} />
          <Route path='/dashboardtickets' element={<DashboardTickets/>} />
          <Route path="/ticket-entry/:ticketId" element={<TicketEntry />} />

              
        </Routes>
      </div>
    </Router>
  </Provider>
  );
}

export default App;
