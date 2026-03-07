import React, { useEffect, useRef } from "react";

export default function UserMenu({ onClose, onEdit, onDelete, onResetPwd }) {
  const ref = useRef(null);

  // fermer si clic en dehors
  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [onClose]);

  return (
    <div ref={ref} className="user-menu">
      <button onClick={onEdit}>Modifier</button>
      <button onClick={onResetPwd}>Réinitialiser le mot de passe</button>
      <button className="danger" onClick={onDelete}>Supprimer</button>
    </div>
  );
}