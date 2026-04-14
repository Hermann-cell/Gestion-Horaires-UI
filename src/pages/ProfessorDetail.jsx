import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProfesseurById, updateProfesseur, assignProfesseurToSeance, unassignProfesseurFromSeance } from "../api/professeurApi";
import { successToast, errorToast } from "../utils/toastServices.js";
import TimeSlotGrid from "../components/TimeSlotGrid";
import AssignmentModal from "../components/AssignmentModal";
import { FiCalendar, FiRefreshCw, FiArrowLeft, FiSave, FiPlusCircle, FiList, FiTrash2 } from "react-icons/fi";
import "../styles/rooms.css";
import "../styles/calendar.css";


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
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUnassigning, setIsUnassigning] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getProfesseurById(id);
      const data = res.data || res;
      setProfesseur(data);

      const initial = [];

      data?.disponibilites?.forEach(d => {
        const jour = d.jour;

        d.plageHoraire_Disponibilites?.forEach(phd => {
          if (phd.plageHoraire) {
            const h = new Date(phd.plageHoraire.heure_debut).getHours();
            initial.push(`${jour}-${h}h`);
          }
        });
      });

      setSelectedSlots(initial);

    } catch { errorToast("Erreur de chargement"); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadData(); }, [id, loadData]);

  const handleSavePlanning = async () => {
    try {
      // On récupère l'auteur depuis le localStorage pour la traçabilité
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const auteurNom = storedUser.prenom ? `${storedUser.prenom} ${storedUser.nom}` : "Admin";

      const payload = {
        modifierPar: auteurNom, // Indispensable pour éviter l'erreur 500
        disponibilites: selectedSlots.map(s => {
          const [jour, hStr] = s.split('-');
          const h = parseInt(hStr);
          return { jour, heure_debut: `${h}`, heure_fin: `${h + 1}` };
        })
      };

      await updateProfesseur(id, payload);
      successToast("Planning sauvegardé avec succès");
      setIsEditing(false);
      loadData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Erreur de sauvegarde";
      errorToast(errorMsg);
    }
  };

  const handleUnassignSubmit = async (seanceId) => {
    if (!seanceId || !Number.isInteger(seanceId)) {
      errorToast("Séance invalide");
      return;
    }

    setIsUnassigning(true);
    try {
      const response = await unassignProfesseurFromSeance(seanceId);
      const message = response?.data?.message || response?.message || "Désaffectation réussie";
      successToast(message);
      await loadData();
    } catch (error) {
      console.error("Erreur désaffectation :", error);
      const message = error?.response?.data?.message || error?.message || "Erreur lors de la désaffectation";
      errorToast(message);
    } finally {
      setIsUnassigning(false);
    }
  };

  const handleAssignSubmit = async (seanceId) => {
    if (!seanceId || !Number.isInteger(seanceId)) {
      errorToast("Séance invalide");
      return;
    }

    setIsAssigning(true);

    try {
      const response = await assignProfesseurToSeance(id, seanceId);

      //  gérer axios OU fetch
      const message =
        response?.data?.message || // axios classique
        response?.message ||      // fallback
        "Affectation réussie";

      successToast(message);

      // UX fluide
      setIsModalOpen(false);

      //  refresh silencieux
      await loadData();

    } catch (error) {
      console.error("Erreur assignation:", error);

      //  extraction intelligente des erreurs backend
      let message = "Erreur lors de l'affectation";

      if (error?.response) {
        // Axios
        message =
          error.response.data?.message ||
          error.response.data?.error ||
          message;
      } else if (error?.message) {
        // JS classique
        message = error.message;
      }

      //  gestion spécifique (option UX)
      if (message.toLowerCase().includes("conflit")) {
        errorToast("⚠️ " + message);
      } else if (message.toLowerCase().includes("disponible")) {
        errorToast("📅 " + message);
      } else if (message.toLowerCase().includes("qualifié")) {
        errorToast("🎓 " + message);
      } else {
        errorToast(message);
      }

    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) return <div className="p-5 text-center">Chargement...</div>;

  return (
    <div className="rooms-page">
      <div className="rooms-container">
        <div className="room-detail-card">
          <div className="room-detail-head border-bottom pb-3 mb-4">
            <div className="d-flex align-items-center gap-3">
              <button className="btn-back-round" onClick={() => navigate(-1)}><FiArrowLeft /></button>
              <div>
                <h2 className="room-detail-title mb-0">{professeur.prenom} {professeur.nom}</h2>
                <span className="badge bg-light text-primary border">{professeur.matricule}</span>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn-secondary" onClick={() => setIsModalOpen(true)}>
                <FiPlusCircle /> Affecter un cours
              </button>
              {isEditing ? (
                <button className="btn-primary" onClick={handleSavePlanning}><FiSave /> Sauvegarder</button>
              ) : (
                <button className="btn-outline-primary" onClick={() => setIsEditing(true)}>Modifier Planning</button>
              )}
            </div>
          </div>

          <div className="row">
            <div className="col-lg-8">
              <div className="calendar-section">
                <h5 className="section-title"><FiCalendar /> Disponibilités hebdomadaires</h5>
                <TimeSlotGrid selectedSlots={selectedSlots} isEditing={isEditing} onToggle={(s) => setSelectedSlots(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} />
              </div>
            </div>

            <div className="col-lg-4">
              <div className="courses-sidebar">
                <h5 className="section-title"><FiList /> Cours assignés</h5>
                <div className="assigned-list">
                  {professeur.seances?.length > 0 ? professeur.seances.map(s => {
                    const seanceDate = new Date(s.date).toLocaleDateString("fr-CA", {
                      weekday: "short",
                      day: "2-digit",
                      month: "2-digit",
                    });
                    const timeLabel = s.plageHoraire
                      ? `${formatHeure(s.plageHoraire.heure_debut)} - ${formatHeure(s.plageHoraire.heure_fin)}`
                      : "Horaire inconnu";

                    return (
                      <div key={s.id} className="assigned-item">
                        <div className="assigned-dot"></div>
                        <div className="assigned-info">
                          <strong>{s.cours?.nom}</strong>
                          <p>{seanceDate} • {timeLabel}</p>
                        </div>
                        <button
                          className="assigned-remove btn-danger"
                          onClick={() => handleUnassignSubmit(s.id)}
                          disabled={isUnassigning}
                          title="Retirer le professeur de cette séance"
                        >
                          <FiTrash2 /> Retirer
                        </button>
                      </div>
                    );
                  }) : <p className="text-muted small">Aucun cours pour le moment.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAssign={handleAssignSubmit}
        isSubmitting={isAssigning}
      />
    </div>
  );
}