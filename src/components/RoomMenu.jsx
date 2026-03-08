import React, { useEffect, useRef } from "react";

export default function RoomMenu({ onClose, onEdit, onDelete, onView }) {
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [onClose]);

  return (
    <div ref={ref} className="user-menu">
      <button onClick={onEdit}>Modifier</button>
      <button onClick={onView}>Voir détails</button>
      <button className="danger" onClick={onDelete}>
        Supprimer
      </button>
    </div>
  );
}