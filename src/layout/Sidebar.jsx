import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  BsSpeedometer2,
  BsPeople,
  BsDoorOpen,
  BsPersonBadge,
  BsCalendarCheck,
  BsBoxArrowRight,
  BsBook,
} from "react-icons/bs";
import logo from "@/assets/logo.jpg";
import "@/styles/sidebar.css";
import { useAuth } from "@/auth/useAuth.js";  

export default function Sidebar() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, isAdmin, logout } = useAuth();

  function openLogoutModal() {
    setShowLogoutModal(true);
  }

  function closeLogoutModal() {
    setShowLogoutModal(false);
  }

  function confirmLogout() {
    logout();
    setShowLogoutModal(false);
    navigate("/login", { replace: true });
  }

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="logo" className="sidebar-logo" />

          <div className="sidebar-brand-text">
            <span className="sidebar-title">Gestion des horaires</span>
            {user?.role && (
              <small className="sidebar-role">{user.role}</small>
            )}
          </div>
        </div>

        <nav>
          <NavLink to="/dashboard" end className="sidebar-link">
            <BsSpeedometer2 /> Tableau de bord
          </NavLink>

          {isAdmin && (
            <NavLink to="/users" className="sidebar-link">
              <BsPeople /> Utilisateurs
            </NavLink>
          )}

          <NavLink to="/rooms" className="sidebar-link">
            <BsDoorOpen /> Salles
          </NavLink>

          <NavLink to="/professors" className="sidebar-link">
            <BsPersonBadge /> Professeurs
          </NavLink>

          <NavLink to="/courses" className="sidebar-link">
            <BsBook /> Cours
          </NavLink>

          <NavLink to="/seances" className="sidebar-link">
            <BsCalendarCheck /> Séances de cours
          </NavLink>

          <NavLink to="/planning" className="sidebar-link">
            <BsCalendarCheck /> Planning academique
          </NavLink>

          <NavLink to="/planning-enseignants" className="sidebar-link">
            <BsCalendarCheck /> Planning enseignants
          </NavLink>
        </nav>

        <button className="logout" onClick={openLogoutModal} type="button">
          <BsBoxArrowRight /> Déconnexion
        </button>
      </div>

      {showLogoutModal && (
        <>
          <div className="modal-backdrop fade show"></div>

          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content logout-modal">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Déconnexion</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Fermer"
                    onClick={closeLogoutModal}
                  ></button>
                </div>

                <div className="modal-body pt-2">
                  <p className="mb-0">
                    Êtes-vous sûr de vouloir vous déconnecter ?
                  </p>
                </div>

                <div className="modal-footer border-0 pt-2">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={closeLogoutModal}
                  >
                    Annuler
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={confirmLogout}
                  >
                    Oui, se déconnecter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}