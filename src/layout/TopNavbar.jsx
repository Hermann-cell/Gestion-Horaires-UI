import { Dropdown } from "react-bootstrap";
import { BsPersonCircle } from "react-icons/bs";
import { useLocation } from "react-router-dom";

export default function TopNavbar() {
  const location = useLocation();

  const getTitle = () => {
  const path = location.pathname;

  if (path === "/app") return "Tableau de bord";
  if (path === "/app/users") return "Gestion des utilisateurs";
  if (path === "/app/rooms") return "Gestion des salles";
  if (path.startsWith("/app/rooms/")) return "Détail de la salle";
  if (path === "/app/professors") return "Professeurs";
  if (path === "/app/planning") return "Planning";

  return "Dashboard";
};

  return (
    <div className="top-navbar">
      {/* Titre de la page */}
      <h2 className="page-title">{getTitle()}</h2>

      {/* Menu utilisateur */}
      <Dropdown align="end">
        <Dropdown.Toggle variant="light" className="user-dropdown">
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