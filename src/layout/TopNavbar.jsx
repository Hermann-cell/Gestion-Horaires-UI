import { Dropdown, Modal, Button } from "react-bootstrap";
import { BsPersonCircle } from "react-icons/bs";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { logoutUser } from "../api/authApi";

export default function TopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userName = user ? `${user.prenom} ${user.nom}` : "Utilisateur";

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
      case "/profile":
        return "Profil utilisateur";
      default:
        return "Dashboard";
    }
  };

  function handleLogoutClick() {
    setShowLogoutModal(true);
  }

  function handleCloseLogoutModal() {
    setShowLogoutModal(false);
  }

  function confirmLogout() {
    logoutUser();
    setShowLogoutModal(false);
    navigate("/login", { replace: true });
  }

  return (
    <>
      <div className="top-navbar">
        <h2 className="page-title">{getTitle()}</h2>

        <Dropdown align="end">
          <Dropdown.Toggle
            variant="light"
            className="user-dropdown user-name"
          >
            <BsPersonCircle size={20} className="me-2" />
            {userName}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => navigate("/profile")}>
              Profil
            </Dropdown.Item>

            <Dropdown.Item>
              Paramètres
            </Dropdown.Item>

            <Dropdown.Divider />

            <Dropdown.Item
              onClick={handleLogoutClick}
              className="text-danger"
            >
              Déconnexion
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Modal
        show={showLogoutModal}
        onHide={handleCloseLogoutModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Déconnexion</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Êtes-vous sûr de vouloir vous déconnecter ?
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseLogoutModal}>
            Annuler
          </Button>

          <Button variant="danger" onClick={confirmLogout}>
            Oui, se déconnecter
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}