import { NavLink, useNavigate } from "react-router-dom";
import {
  BsSpeedometer2,
  BsPeople,
  BsDoorOpen,
  BsPersonBadge,
  BsCalendarCheck,
  BsBoxArrowRight,
} from "react-icons/bs";
import { logoutUser } from "../api/authApi.js";

export default function Sidebar() {

  const navigate = useNavigate();

  function handleLogout() {

    const confirmLogout = window.confirm(
      "Êtes-vous sûr de vouloir vous déconnecter ?"
    );

    if (!confirmLogout) return;

    logoutUser();

    navigate("/login", { replace: true });

  }

  return (

    <div className="sidebar">

      <h3 className="sidebar-title">
        GESTION DES HORAIRES
      </h3>

      <nav>

        <NavLink to="/" end className="sidebar-link">
          <BsSpeedometer2 /> Tableau de bord
        </NavLink>

        <NavLink to="/app/users" className="sidebar-link">
          <BsPeople /> Utilisateurs
        </NavLink>

        <NavLink to="/app/rooms" className="sidebar-link">
          <BsDoorOpen /> Salles
        </NavLink>

        <NavLink to="/app/professors" className="sidebar-link">
          <BsPersonBadge /> Professeurs
        </NavLink>

        <NavLink to="/app/planning" className="sidebar-link">
          <BsCalendarCheck /> Planning
        </NavLink>

      </nav>

      <button
        className="logout"
        onClick={handleLogout}
        type="button"
      >

        <BsBoxArrowRight /> Déconnexion

      </button>

    </div>

  );
}