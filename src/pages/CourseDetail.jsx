// src/pages/CourseDetail.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../styles/rooms.css";
import * as coursApi from "../api/coursApi";

export default function CourseDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [course, setCourse] = useState(location.state?.course || null);
  const [loading, setLoading] = useState(!location.state?.course);

  // 🔥 fallback API (SANS casser UI)
  useEffect(() => {
    if (course) return;

    async function fetchCourse() {
      try {
        const res = await coursApi.getCoursById(id);
        const data = res.data || res;

        // Adapter au format frontend (comme Rooms)
        setCourse({
          id: data.id,
          code: data.code,
          nom: data.nom,
          duree: data.duree,
          etape: data.etape,
          est_harchive: data.est_harchive,
        });
      } catch (err) {
        console.error("Erreur chargement cours", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [id, course]);

  return (
    <div className="rooms-page">
      <div className="rooms-container">
        <div className="room-detail-card">
          <div className="room-detail-head">
            <div>
              <p className="room-detail-eyebrow">Détail du cours</p>
              <h2 className="room-detail-title">
                {course?.nom || `Cours #${id}`}
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
              <span className="detail-value">
                {course?.code || "-"}
              </span>
            </div>

            <div className="room-detail-item">
              <span className="detail-label">Nom du cours</span>
              <span className="detail-value">
                {course?.nom || "-"}
              </span>
            </div>

            <div className="room-detail-item">
              <span className="detail-label">Durée</span>
              <span className="detail-value">
                {course?.duree || "-"}
              </span>
            </div>

            <div className="room-detail-item">
              <span className="detail-label">Étape</span>
              <span className="detail-value">
                {course?.etape || "-"}
              </span>
            </div>
          </div>

          <div className="room-detail-description">
            <span className="detail-label">Description</span>
            <p className="detail-description-text">
              {course
                ? `Cours ${course.nom} (${course.code}), durée ${course.duree}, étape ${course.etape}.`
                : "Aucune description renseignée pour ce cours."}
            </p>
          </div>

          {!course && !loading && (
            <div className="detail-warning">
              Les données complètes du cours ne sont pas disponibles. Pour
              l’instant, la page détail utilise les données envoyées depuis la
              liste. Quand le backend sera branché, on chargera le cours avec
              son id.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}