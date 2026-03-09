import { Dropdown } from "react-bootstrap";
import { BsPersonCircle } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { logoutUser } from "../api/authApi";

export default function TopNavbar() {

  const location = useLocation();
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");

  const getTitle = () => {

    const path = location.pathname;

    switch (path) {
      case "/":
        return "Tableau de bord";
      case "/users":
        return "Gestion des utilisateurs";
      case "/rooms":
        return "Salles";
      case "/professors":
        return "Professeurs";
      case "/planning":
        return "Planning";
      default:
        return "Dashboard";
    }

  };

  useEffect(() => {

    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      setUserName(`${user.prenom} ${user.nom}`);
    }

  }, []);

  function handleLogout() {

    const confirmLogout = window.confirm(
      "Êtes-vous sûr de vouloir vous déconnecter ?"
    );

    if (!confirmLogout) return;

    logoutUser();

    navigate("/login", { replace: true });

  }


  return (

    <div className="top-navbar">

      {/* Titre */}
      <h2 className="page-title">
        {getTitle()}
      </h2>

      {/* Dropdown utilisateur */}
      <Dropdown align="end">

        <Dropdown.Toggle
          variant="light"
          className="user-dropdown user-name"
        >

          <BsPersonCircle size={20} className="me-2" />

          {userName || "Utilisateur"}

        </Dropdown.Toggle>

        <Dropdown.Menu>

          <Dropdown.Item>
            Profil
          </Dropdown.Item>

          <Dropdown.Item>
            Paramètres
          </Dropdown.Item>

          <Dropdown.Divider />

          <Dropdown.Item
            onClick={handleLogout}
            className="text-danger"
          >
            Déconnexion
          </Dropdown.Item>

        </Dropdown.Menu>

      </Dropdown>

    </div>

  );
}