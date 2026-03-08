import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../styles/rooms.css";

export default function RoomDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const room = location.state?.room;

  return (
    <div className="rooms-page">
      <div className="rooms-container">
        <div className="room-detail-card">
          <div className="room-detail-head">
            <div>
              <p className="room-detail-eyebrow">Détail de la salle</p>
              <h2 className="room-detail-title">
                {room?.name || `Salle #${id}`}
              </h2>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              Retour
            </button>
          </div>

          <div className="room-detail-grid">
            <div className="room-detail-item">
              <span className="detail-label">Code</span>
              <span className="detail-value">{room?.code || "-"}</span>
            </div>

            <div className="room-detail-item">
              <span className="detail-label">Nom salle</span>
              <span className="detail-value">{room?.name || "-"}</span>
            </div>

            <div className="room-detail-item">
              <span className="detail-label">Type</span>
              <span className="detail-value">{room?.type || "-"}</span>
            </div>

            <div className="room-detail-item">
              <span className="detail-label">Capacité</span>
              <span className="detail-value">{room?.capacity || "-"}</span>
            </div>
          </div>

          <div className="room-detail-description">
            <span className="detail-label">Description</span>
            <p className="detail-description-text">
              {room?.description?.trim()
                ? room.description
                : "Aucune description renseignée pour cette salle."}
            </p>
          </div>

          {!room && (
            <div className="detail-warning">
              Les données complètes de la salle ne sont pas disponibles. Pour
              l’instant, la page détail utilise les données envoyées depuis la
              liste. Quand le backend sera branché, on chargera la salle avec
              son id.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}