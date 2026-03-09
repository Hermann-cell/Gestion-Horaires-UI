import React from "react";
import RoomRow from "./RoomRow.jsx";

export default function RoomTable({ rooms, onDelete, onEdit, onView }) {
  return (
    <div className="table-container">
      <table className="users-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Type</th>
            <th>Capacité</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {rooms.map((room) => (
            <RoomRow
              key={room.id}
              room={room}
              onDelete={onDelete}
              onEdit={onEdit}
              onView={onView}
            />
          ))}
        </tbody>
      </table>

      {rooms.length === 0 && (
        <div className="empty-state">Aucune salle trouvée.</div>
      )}
    </div>
  );
}