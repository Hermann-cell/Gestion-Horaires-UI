import { Dropdown } from "react-bootstrap";
import { BsPersonCircle } from "react-icons/bs";
import { useLocation } from "react-router-dom";

export default function TopNavbar() {
  const location = useLocation();

  const getTitle = () => {
    const path = location.pathname;

    switch (path) {
      case "/":
        return "Tableau de bord";
      case "/users":
        return "Utilisateurs";
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

  return (
    <div className="top-navbar">
      <h2>{getTitle()}</h2>

      <Dropdown align="end">
        <Dropdown.Toggle variant="light">
          <BsPersonCircle size={20} className="me-2" />
          Admin
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item>Profil</Dropdown.Item>
          <Dropdown.Item>Paramètres</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item>Déconnexion</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}