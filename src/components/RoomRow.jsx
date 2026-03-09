import React, { useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import RoomMenu from "./RoomMenu.jsx";

export default function RoomRow({ room, onDelete, onEdit, onView }) {
  const [open, setOpen] = useState(false);

  return (
    <tr className="room-row">
      <td className="room-code">{room.code}</td>
      <td>
        <span className="room-type-badge">{room.typeDeSalle.nom}</span>
      </td>
      <td>{room.capacite}</td>

      <td className="menu-cell">
        <button
          className="menu-btn"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <FiMoreHorizontal />
        </button>

        {open && (
          <RoomMenu
            onClose={() => setOpen(false)}
            onEdit={() => {
              setOpen(false);
              onEdit(room);
            }}
            onDelete={() => {
              setOpen(false);
              onDelete(room.id);
            }}
            onView={() => {
              setOpen(false);
              onView?.(room);
            }}
          />
        )}
      </td>
    </tr>
  );
}