import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProfesseurById } from "../api/professeurApi";
import "../styles/rooms.css";


const formatHeure = (dateString) => {
  return new Date(dateString).toLocaleTimeString("fr-CA", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ProfessorDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [professeur, setProfesseur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfesseur = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProfesseurById(id);
      setProfesseur(data);
    } catch (err) {
      console.error("Erreur complète :", err);
      console.error("Response :", err?.response);
      console.error("Status :", err?.response?.status);
      console.error("Data :", err?.response?.data);

      setError(
        err?.response?.data?.message || "Impossible de charger le professeur."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfesseur();
  }, [id]);

  if (loading) return <p style={{ padding: 20 }}>Chargement...</p>;
  if (error) return <p style={{ padding: 20 }}>{error}</p>;
  if (!professeur) return <p style={{ padding: 20 }}>Professeur introuvable.</p>;

  return (
    <div className="rooms-page">
      <div className="rooms-container">
        <div className="room-detail-card">
          <div className="room-detail-head">
            <div>
              <p className="room-detail-eyebrow">Détail du professeur</p>
              <h2 className="room-detail-title">
                {`${professeur?.prenom || ""} ${professeur?.nom || ""}`.trim() || `Professeur #${id}`}
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
              <span className="detail-label">Prénom</span>
              <span className="detail-value">{professeur?.prenom || "-"}</span>
            </div>

            <div className="room-detail-item">
              <span className="detail-label">Nom</span>
              <span className="detail-value">{professeur?.nom || "-"}</span>
            </div>

            <div className="room-detail-item">
              <span className="detail-label">Matricule</span>
              <span className="detail-value">{professeur?.matricule || "-"}</span>
            </div>

            <div className="room-detail-item">
              <span className="detail-label">Nombre de spécialités</span>
              <span className="detail-value">
                {professeur?.specialite_professeurs?.length || 0}
              </span>
            </div>
          </div>

          <div className="room-detail-description" style={{ marginBottom: 20 }}>
            <span className="detail-label">Spécialités</span>
            {professeur?.specialite_professeurs?.length > 0 ? (
              <ul style={{ marginTop: 12, paddingLeft: 20 }}>
                {professeur.specialite_professeurs.map((sp) => (
                  <li key={sp.id}>
                    {sp?.specialite?.nom || "Spécialité inconnue"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="detail-description-text">
                Aucune spécialité renseignée pour ce professeur.
              </p>
            )}
          </div>

          <div className="room-detail-description">
            <span className="detail-label">Disponibilités</span>

            {professeur?.disponibilite_professeurs?.length > 0 ? (
              <ul style={{ marginTop: 12, paddingLeft: 20 }}>
                {professeur.disponibilite_professeurs.map((d) => (
                  <li key={d.id}>
                    {d?.disponibilite?.jour || d?.jour || "Jour inconnu"} —{" "}
                    {d?.disponibilite?.heure_debut || d?.heure_debut || "--"} à{" "}
                    {d?.disponibilite?.heure_fin || d?.heure_fin || "--"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="detail-description-text">
                Aucune disponibilité renseignée pour ce professeur.
              </p>
            )}

            <button
              type="button"
              className="btn-primary"
              style={{ marginTop: 18, width: "100%" }}
            >
              + Ajouter une disponibilité
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}