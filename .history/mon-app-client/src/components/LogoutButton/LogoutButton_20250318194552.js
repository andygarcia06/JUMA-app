import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/userSlice"; // Assurez-vous que votre slice Redux contient cette action
import { LogOut } from "react-feather"; // Icône de déconnexion
import "./LogoutButton.css"; // Import du style CSS

const LogoutButton = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser()); // Supprime `userData` de Redux
    navigate("/login"); // Redirige vers la page de connexion
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      <LogOut size={20} color="white" />
    </button>
  );
};

export default LogoutButton;
