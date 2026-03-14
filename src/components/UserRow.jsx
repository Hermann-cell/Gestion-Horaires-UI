import React, { useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import UserMenu from "./UserMenu.jsx";

export default function UserRow({ user, onDelete, onEdit }) {
  const [open, setOpen] = useState(false);

  const roleClass =
    user.role === "Administrateur" ? "role-admin" : "role-resp";

  const statusClass =
    user.statut === true ? "status-active" : "status-inactive";

  return (
    <tr className="user-row">
      <td className="user-name">
        <div className="avatar">
          {user.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        {user.name}
      </td>

      <td>{user.email}</td>

      <td>
        <span className={`role-badge ${roleClass}`}>
          {user.role}
        </span>
      </td>

      <td>
        <span className={`status-badge ${statusClass}`}>
          {user.statut ? "Actif" : "Inactif"}
        </span>
      </td>

      <td className="menu-cell">
        <button className="menu-btn" onClick={() => setOpen((v) => !v)}>
          <FiMoreHorizontal />
        </button>

        {open && (
          <UserMenu
            onClose={() => setOpen(false)}

            onEdit={() => {
              setOpen(false);
              onEdit(user);
            }}

            onDelete={() => {
              setOpen(false);
              onDelete(user.id);
            }}

            onResetPwd={() => {
              setOpen(false);
              alert("Réinitialiser le mot de passe (plus tard)");
            }}
          />
        )}
      </td>
    </tr>
  );
}