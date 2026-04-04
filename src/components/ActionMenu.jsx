// src/components/ActionMenu.jsx
import React, { useEffect, useRef } from "react";

export default function ActionMenu({ onClose, onEdit, onDelete, onView }) {
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} className="user-menu">
      <button onClick={onEdit}>Modifier</button>
      {onView && <button onClick={onView}>Voir détails</button>}
      <button className="danger" onClick={onDelete}>
        Supprimer
      </button>
    </div>
  );
}