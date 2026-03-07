import React from "react";
import UserRow from "./UserRow.jsx";

export default function UserTable({ users, onDelete, onEdit  }) {
  return (
    <div className="table-container">
      <table className="users-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
           <UserRow
      key={u.id}
      user={u}
      onDelete={onDelete}
      onEdit={onEdit}
    />
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="empty-state">Aucun utilisateur trouvé.</div>
      )}
    </div>
  );
}