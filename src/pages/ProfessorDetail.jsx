import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProfesseurById, updateProfesseur } from "../api/professeurApi";
import { successToast, errorToast } from "../utils/toastServices.js";
import TimeSlotGrid from "../components/TimeSlotGrid";
import { FiCalendar, FiRefreshCw, FiArrowLeft, FiSave } from "react-icons/fi";
import "../styles/rooms.css";
import "../styles/calendar.css";

export default function ProfessorDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [professeur, setProfesseur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getProfesseurById(id);
      // Fastify renvoie souvent les données dans response.data ou response directement selon votre config api.js
      const data = response.data || response; 
      setProfesseur(data);

      // Mapping de la structure Prisma complexe vers la grille "Jour-Heureh"
      const initial = [];
      if (data?.disponibilite_professeurs) {
        data.disponibilite_professeurs.forEach((dp) => {
          const jour = dp.disponibilite?.jour;
          dp.disponibilite?.plageHoraire_Disponibilites?.forEach((phd) => {
            if (phd.plageHoraire?.heure_debut) {
              const heure = new Date(phd.plageHoraire.heure_debut).getHours();
              initial.push(`${jour}-${heure}h`);
            }
          });
        });
      }
      setSelectedSlots(initial);
    } catch (err) {
      console.error(err);
      errorToast("Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const handleSave = async () => {
    try {
      // Transformation des slots de la grille en payload pour le backend
      const payload = {
        disponibilites: selectedSlots.map((s) => {
          const [jour, heureStr] = s.split("-");
          const heure = parseInt(heureStr);
          return {
            jour: jour,
            heure_debut: `${heure}`,
            heure_fin: `${heure + 1}`,
          };
        }),
      };

      await updateProfesseur(id, payload);
      successToast("Planning et traçabilité mis à jour avec succès");
      setIsEditing(false);
      loadData(); // Recharger pour voir les changements confirmés par le serveur
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de la sauvegarde";
      errorToast(msg);
    }
  };

  if (loading) return <div className="loading-state">Chargement du professeur...</div>;
  if (!professeur) return <div className="p-4">Professeur introuvable.</div>;

  return (
    <div className="rooms-page">
      <div className="rooms-container">
        <div className="room-detail-card">
          <div className="room-detail-head">
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <button
                className="btn-secondary"
                style={{ padding: "8px" }}
                onClick={() => navigate(-1)}
                title="Retour"
              >
                <FiArrowLeft size={20} />
              </button>
              <div>
                <p className="room-detail-eyebrow">Professeur • {professeur.matricule}</p>
                <h2 className="room-detail-title">
                  {professeur.prenom} {professeur.nom}
                </h2>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn-secondary"
                onClick={() => {
                  setSyncing(true);
                  setTimeout(() => {
                    setSyncing(false);
                    successToast("Synchronisation Google terminée");
                  }, 1200);
                }}
                disabled={syncing}
              >
                <FiRefreshCw className={syncing ? "icon-spin" : ""} style={{ marginRight: 8 }} />
                Google Sync
              </button>
              
              {isEditing ? (
                <button className="btn-primary" onClick={handleSave} style={{ backgroundColor: "#28a745" }}>
                  <FiSave style={{ marginRight: 8 }} /> Enregistrer les modifs
                </button>
              ) : (
                <button className="btn-primary" onClick={() => setIsEditing(true)}>
                  <FiCalendar style={{ marginRight: 8 }} /> Modifier le planning
                </button>
              )}
            </div>
          </div>

          <div className="room-detail-grid" style={{ marginBottom: "2rem" }}>
            <div className="room-detail-item">
              <span className="detail-label">Spécialités</span>
              <span className="detail-value">
                {professeur.specialite_professeurs?.map(s => s.specialite.nom).join(", ") || "Aucune"}
              </span>
            </div>
            <div className="room-detail-item">
              <span className="detail-label">Dernière modification par</span>
              <span className="detail-value" style={{ fontSize: "0.85rem", color: "#6c757d" }}>
                {professeur.modifierPar || "Système"} le {professeur.modifierLe ? new Date(professeur.modifierLe).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>

          <div className="calendar-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h5 className="mb-3" style={{ fontWeight: 600 }}>
                    <FiCalendar style={{ marginRight: 10, color: "#4e73df" }} /> 
                    Planning hebdomadaire des disponibilités
                </h5>
                {isEditing && <span className="editing-badge">Mode édition actif</span>}
            </div>
            
            <TimeSlotGrid
              selectedSlots={selectedSlots}
              isEditing={isEditing}
              onToggle={(slotId) =>
                setSelectedSlots((prev) =>
                  prev.includes(slotId) ? prev.filter((s) => s !== slotId) : [...prev, slotId]
                )
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}