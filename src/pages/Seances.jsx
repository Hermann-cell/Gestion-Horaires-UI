import React, { useEffect, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  getSeances,
  createSeance,
  updateSeance,
  deleteSeance,
  assignProfesseurToSeance,
  unassignProfesseurFromSeance,
} from "@/api/seanceApi";
import { getProfesseurs } from "@/api/professeurApi";
import { getSalles } from "@/api/salleApi";
import { getCours } from "@/api/coursApi";
import { getPlageHoraires } from "@/api/plageHoraireApi";
import { successToast, errorToast } from "@/utils/toastServices.js";
import { generateSeancesPDF } from "@/utils/generateSeancesPDF.js";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiArrowLeft,
  FiFilter,
  FiSearch,
  FiArrowUp,
  FiArrowDown,
  FiDownload,
} from "react-icons/fi";
import "@/styles/seances.css";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("fr-CA", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatHeure = (dateString) => {
  return new Date(dateString).toLocaleTimeString("fr-CA", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const emptyForm = {
  id: null,
  date: "",
  coursId: null,
  salleId: null,
  plageHoraireId: null,
  professeurId: null,
};

function SeanceRow({
  seance,
  onEdit,
  onDelete,
  openMenuId,
  setOpenMenuId,
}) {
  const coursNom = seance.cours?.nom || "Cours inconnu";
  const salleCode = seance.salle?.code || "Salle inconnue";
  const profName = seance.professeur
    ? `${seance.professeur.prenom} ${seance.professeur.nom}`.trim()
    : "Non assigné";
  const isOpen = openMenuId === seance.id;

  return (
    <tr className="seance-row">
      <td className="seance-cours">
        <strong>{coursNom}</strong>
        <span className="badge-small">{seance.salle?.typeDeSalle?.nom}</span>
      </td>
      <td className="seance-salle">{salleCode}</td>
      <td className="seance-date">{formatDate(seance.date)}</td>
      <td className="seance-time">
        {formatHeure(seance.plageHoraire?.heure_debut)} -{" "}
        {formatHeure(seance.plageHoraire?.heure_fin)}
      </td>
      <td className={`seance-prof ${!seance.professeur ? "unassigned" : ""}`}>
        {profName}
      </td>
      <td className="seance-actions">
        <div style={{ position: "relative" }}>
          <button
            className="menu-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(isOpen ? null : seance.id);
            }}
          >
            ⋮
          </button>

          {isOpen && (
            <div
              className="seance-menu"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "absolute",
                top: "32px",
                right: 0,
                zIndex: 1000,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setOpenMenuId(null);
                  onEdit(seance);
                }}
              >
                <FiEdit2 /> Modifier
              </button>

              {!seance.professeur && (
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenuId(null);
                    onEdit(seance);
                  }}
                >
                  <FiPlus /> Assigner professeur
                </button>
              )}

              {seance.professeur && (
                <button
                  type="button"
                  onClick={async () => {
                    setOpenMenuId(null);
                    try {
                      await unassignProfesseurFromSeance(seance.id);
                      successToast("Professeur retiré");
                      await loadData(); // Recharge les données
                    } catch (err) {
                      const errorMessage =
                        err?.response?.data?.message ||
                        err?.message ||
                        "Erreur lors du retrait";
                      errorToast(errorMessage);
                    }
                  }}
                  className="danger"
                >
                  Retirer professeur
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setOpenMenuId(null);
                  onDelete(seance.id);
                }}
                className="danger"
              >
                <FiTrash2 /> Supprimer
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function Seances() {
  const navigate = useNavigate();
  const [seances, setSeances] = useState([]);
  const [cours, setCours] = useState([]);
  const [salles, setSalles] = useState([]);
  const [professeurs, setProfesseurs] = useState([]);
  const [plageHoraires, setPlageHoraires] = useState([]);

  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [mode, setMode] = useState("create");

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const [query, setQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterCours, setFilterCours] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [seancesRes, coursRes, sallesRes, profsRes, plagesRes] = await Promise.all([
        getSeances(),
        getCours(),
        getSalles(),
        getProfesseurs(),
        getPlageHoraires(),
      ]);

      setSeances(Array.isArray(seancesRes) ? seancesRes : seancesRes.data || []);
      setCours(Array.isArray(coursRes) ? coursRes : coursRes.data || []);
      setSalles(Array.isArray(sallesRes) ? sallesRes : sallesRes.data || []);
      setProfesseurs(Array.isArray(profsRes) ? profsRes : profsRes.data || []);
      setPlageHoraires(Array.isArray(plagesRes) ? plagesRes : plagesRes.data || []);
    } catch (err) {
      console.error("Erreur chargement:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors du chargement des données";
      errorToast(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter compatible professors for current form state
  const getCompatibleProfesseurs = () => {
    if (!form.date || !form.plageHoraireId || !form.coursId) {
      return []; // Only show compatible when all required fields are filled
    }

    const jours = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    const jour = jours[new Date(form.date).getDay()];
    const seanceDate = new Date(form.date).toDateString();
    const coursSelected = cours.find((c) => c.id === form.coursId);

    return professeurs.filter((prof) => {
      // Check specialite compatibility
      if (coursSelected?.specialiteId) {
        const hasSpecialite = prof.specialite_professeurs?.some(
          (sp) => sp.specialiteId === coursSelected.specialiteId && sp.supprimeLe === null
        );
        if (!hasSpecialite) return false;
      }

      // Check availability at this date/time slot
      const isAvailable = prof.disponibilites?.some((disp) => {
        if (disp.supprimeLe !== null) return false;
        const memeJour = disp.jour?.trim().toLowerCase() === jour;
        if (!memeJour) return false;
        return disp.plageHoraire_Disponibilites?.some((phd) => {
          return phd.supprimeLe === null && phd.plageHoraireId === form.plageHoraireId;
        });
      });
      if (!isAvailable) return false;

      // Check no conflict with other seances at this date/time
      const hasConflict = seances.some(
        (s) =>
          s.id !== form.id &&
          new Date(s.date).toDateString() === seanceDate &&
          s.professeurId === prof.id &&
          s.plageHoraireId === form.plageHoraireId &&
          s.supprimeLe === null
      );
      if (hasConflict) return false;

      return true;
    });
  };

  // Check for conflicts
  const checkConflicts = (formData) => {
    const errors = [];

    if (!formData.date || !formData.plageHoraireId || !formData.coursId || !formData.salleId) {
      return errors;
    }

    const plage = plageHoraires.find((p) => p.id === formData.plageHoraireId);
    if (!plage) return errors;

    const seanceDate = new Date(formData.date).toDateString();

    // Check salle conflict
    const salleConflict = seances.find(
      (s) =>
        s.id !== formData.id &&
        new Date(s.date).toDateString() === seanceDate &&
        s.salleId === formData.salleId &&
        s.plageHoraireId === formData.plageHoraireId &&
        s.supprimeLe === null
    );

    if (salleConflict) {
      errors.push(`Salle occupée: ${salleConflict.salle?.code || "inconnu"}`);
    }

    // Check professeur conflict (if assigned)
    if (formData.professeurId) {
      const prof = professeurs.find((p) => p.id === formData.professeurId);
      
      // Check availability
      const jours = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
      const jour = jours[new Date(formData.date).getDay()];
      const isAvailable = prof?.disponibilites?.some((disp) => {
        if (disp.supprimeLe !== null) return false;
        const memeJour = disp.jour?.trim().toLowerCase() === jour;
        if (!memeJour) return false;
        return disp.plageHoraire_Disponibilites?.some((phd) => {
          return phd.supprimeLe === null && phd.plageHoraireId === formData.plageHoraireId;
        });
      });

      if (!isAvailable) {
        errors.push(`Le professeur n'est pas disponible à cette date/horaire`);
      }

      // Check conflict with other seances
      const profConflict = seances.find(
        (s) =>
          s.id !== formData.id &&
          new Date(s.date).toDateString() === seanceDate &&
          s.professeurId === formData.professeurId &&
          s.plageHoraireId === formData.plageHoraireId &&
          s.supprimeLe === null
      );

      if (profConflict) {
        errors.push(`Le professeur est déjà affecté à cette date/horaire`);
      }

      // Check specialite
      const cours_selected = cours.find((c) => c.id === formData.coursId);
      if (cours_selected?.specialiteId) {
        const hasSpecialite = prof?.specialite_professeurs?.some(
          (sp) => sp.specialiteId === cours_selected.specialiteId
        );
        if (!hasSpecialite) {
          const coursSpecialite = cours_selected.specialite?.nom || "inconnue";
          const professeurSpecialites = prof?.specialite_professeurs
            ?.map((sp) => sp.specialite?.nom)
            .join(", ") || "Aucune";
          errors.push(`Spécialité incompatible. Cours: ${coursSpecialite}, Professeur: ${professeurSpecialites}`);
        }
      }
    }

    return errors;
  };

  const handleOpenModal = (seance = null) => {
    if (seance) {
      setMode("edit");
      setForm({
        id: seance.id,
        date: seance.date.split("T")[0],
        coursId: seance.coursId,
        salleId: seance.salleId,
        plageHoraireId: seance.plageHoraireId,
        professeurId: seance.professeurId || null,
      });
    } else {
      setMode("create");
      setForm(emptyForm);
    }
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Validation
    if (!form.date || !form.coursId || !form.salleId || !form.plageHoraireId) {
      setFormError("❌ Tous les champs requis doivent être remplis");
      return;
    }

    const conflicts = checkConflicts(form);
    if (conflicts.length > 0) {
      setFormError("⚠️ Conflits d'horaire détectés:\n" + conflicts.map(c => "• " + c).join("\n"));
      return;
    }

    setIsSubmitting(true);
    try {
      const getAuteur = () => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        return user.prenom && user.nom ? `${user.prenom} ${user.nom}`.trim() : "Admin";
      };

      const payload = {
        date: new Date(form.date).toISOString(),
        coursId: Number(form.coursId),
        salleId: Number(form.salleId),
        plageHoraireId: Number(form.plageHoraireId),
        ...(form.professeurId ? { professeurId: Number(form.professeurId) } : {}),
        ...(mode === "edit" ? { modifierPar: getAuteur() } : { creerPar: getAuteur() }),
      };

      if (mode === "create") {
        await createSeance(payload);
        successToast("Séance créée avec succès");
      } else {
        await updateSeance(form.id, payload);
        successToast("Séance modifiée avec succès");
      }

      setIsModalOpen(false);
      setForm(emptyForm);
      await loadData();
    } catch (error) {
      console.error("Erreur:", error);
      // Extract error message with fallback to different error sources
      let errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erreur lors de la sauvegarde";
      
      // Format the error message for better readability
      if (errorMessage.includes("professeur n'a pas la spécialité")) {
        const match = errorMessage.match(/Cours: (.*?), Spécialités du professeur: (.*)/);
        if (match) {
          errorMessage = `❌ Spécialité incompatible\n• Cours demande: ${match[1]}\n• Professeur possède: ${match[2]}`;
        }
      } else if (errorMessage.includes("disponible")) {
        errorMessage = "❌ Le professeur n'est pas disponible pour cette date/horaire";
      } else if (errorMessage.includes("occupée")) {
        errorMessage = "❌ La salle est déjà occupée à cette date/horaire";
      } else if (errorMessage.includes("affecté à une autre séance")) {
        errorMessage = "❌ Le professeur est déjà affecté à une autre séance à cette date/horaire";
      }
      
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette séance ?")) {
      return;
    }

    try {
      await deleteSeance(id);
      setSeances((prev) => prev.filter((s) => s.id !== id));
      successToast("Séance supprimée");
      setOpenMenuId(null);
    } catch (err) {
      console.error("Erreur suppression:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors de la suppression";
      errorToast(errorMessage);
    }
  };

  const handleExportSeancesPDF = async () => {
    try {
      setIsExportingPDF(true);

      const seancesData = filteredSeances.map((seance) => ({
        cours: seance.cours?.nom || "N/A",
        codeCours: seance.cours?.code || "",
        professeur: seance.professeur
          ? `${seance.professeur.prenom} ${seance.professeur.nom}`.trim()
          : "Non assigné",
        salle: seance.salle?.code || "N/A",
        date: seance.date,
        heureDebut: seance.plageHoraire?.heure_debut,
        heureFin: seance.plageHoraire?.heure_fin,
      }));

      const filename = `Seances_${new Date().toISOString().split("T")[0]}.pdf`;
      await generateSeancesPDF(seancesData, filename);
    } catch (err) {
      console.error("Erreur export PDF:", err);
      errorToast("Erreur lors de l'exportation du PDF");
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Filter and sort
  const filteredSeances = useMemo(() => {
    let result = [...seances];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (s) =>
          s.cours?.nom?.toLowerCase().includes(q) ||
          s.salle?.code?.toLowerCase().includes(q) ||
          (s.professeur &&
            `${s.professeur.prenom} ${s.professeur.nom}`
              .toLowerCase()
              .includes(q))
      );
    }

    if (filterDate) {
      const targetDate = new Date(filterDate).toDateString();
      result = result.filter(
        (s) => new Date(s.date).toDateString() === targetDate
      );
    }

    if (filterCours && filterCours !== "all") {
      result = result.filter((s) => s.coursId === Number(filterCours));
    }

    // Filter undeleted only
    result = result.filter((s) => s.supprimeLe === null);

    // Sort
    result.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case "date":
          aVal = new Date(a.date);
          bVal = new Date(b.date);
          break;
        case "cours":
          aVal = a.cours?.nom || "";
          bVal = b.cours?.nom || "";
          break;
        case "prof":
          aVal = a.professeur ? `${a.professeur.prenom} ${a.professeur.nom}` : "zzz";
          bVal = b.professeur ? `${b.professeur.prenom} ${b.professeur.nom}` : "zzz";
          break;
        default:
          aVal = a.date;
          bVal = b.date;
      }

      if (typeof aVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [seances, query, filterDate, filterCours, sortBy, sortOrder]);

  if (loading)
    return (
      <div className="seances-page">
        <div className="text-center p-5">Chargement...</div>
      </div>
    );

  return (
    <div className="seances-page">
      <div className="seances-container">
        <div className="seances-header">
          <h2 className="seances-title">
            <FiFilter /> Gestion des séances de cours
          </h2>
          <div className="d-flex gap-2">
            <button
              className="btn-primary-lg"
              onClick={() => handleOpenModal()}
              type="button"
            >
              <FiPlus /> Créer une séance
            </button>
            <button
              className="btn btn-success"
              onClick={handleExportSeancesPDF}
              disabled={isExportingPDF || seances.length === 0}
              type="button"
              title="Exporter les séances en PDF"
            >
              <FiDownload size={16} className="me-1" />
              {isExportingPDF ? "Export..." : "Export PDF"}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-value">{seances.length}</div>
            <div className="stat-label">Total séances</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {seances.filter((s) => !s.professeur && s.supprimeLe === null).length}
            </div>
            <div className="stat-label">Non assignées</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {seances.filter((s) => s.professeur && s.supprimeLe === null).length}
            </div>
            <div className="stat-label">Assignées</div>
          </div>
        </div>

        <div className="seances-filters">
          <div className="filter-input">
            <FiSearch />
            <input
              type="text"
              placeholder="Rechercher cours, salle, professeur..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="filter-date"
          />

          <select
            value={filterCours}
            onChange={(e) => setFilterCours(e.target.value)}
            className="filter-select"
          >
            <option value="">Tous les cours</option>
            {cours.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>

          <div className="sort-controls">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="date">Trier par date</option>
              <option value="cours">Trier par cours</option>
              <option value="prof">Trier par prof</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="btn-sort"
            >
              {sortOrder === "asc" ? <FiArrowUp /> : <FiArrowDown />}
            </button>
          </div>
        </div>

        {filteredSeances.length > 0 ? (
          <div className="seances-table-wrapper">
            <table className="seances-table">
              <thead>
                <tr>
                  <th>Cours</th>
                  <th>Salle</th>
                  <th>Date</th>
                  <th>Horaire</th>
                  <th>Professeur</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSeances.map((seance) => (
                  <SeanceRow
                    key={seance.id}
                    seance={seance}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>Aucune séance trouvée</p>
          </div>
        )}
      </div>

      {/* Modal - rendered via portal */}
      {isModalOpen &&
        createPortal(
          <>
            <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}></div>
            <div className="seances-modal">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>{mode === "create" ? "Créer une séance" : "Modifier la séance"}</h3>
                  <button
                    className="btn-close"
                    onClick={() => setIsModalOpen(false)}
                    type="button"
                  >
                    <FiX />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="seances-form">
                {formError && (
                  <div 
                    className="form-error" 
                    style={{ 
                      whiteSpace: "pre-wrap", 
                      wordWrap: "break-word",
                      padding: "12px",
                      backgroundColor: "#fee",
                      borderLeft: "4px solid #dc3545",
                      borderRadius: "4px"
                    }}
                  >
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => {
                      setForm({ ...form, date: e.target.value, professeurId: null });
                      setFormError(""); // Clear errors when date changes
                    }}
                  />
                  {form.date && (
                    <small style={{ color: "#666", display: "block", marginTop: "4px" }}>
                      📅 {new Date(form.date).toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" })}
                    </small>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Cours *</label>
                    <select
                      required
                      value={form.coursId || ""}
                      onChange={(e) => setForm({ ...form, coursId: Number(e.target.value), professeurId: null })}
                    >
                      <option value="">Sélectionner...</option>
                      {cours.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom} {c.specialite ? `(${c.specialite.nom})` : "(Sans spécialité)"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Salle *</label>
                    <select
                      required
                      value={form.salleId || ""}
                      onChange={(e) => setForm({ ...form, salleId: Number(e.target.value) })}
                    >
                      <option value="">Sélectionner...</option>
                      {salles.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code} - {s.typeDeSalle?.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Plage horaire *</label>
                    <select
                      required
                      value={form.plageHoraireId || ""}
                      onChange={(e) => {
                        setForm({ ...form, plageHoraireId: Number(e.target.value), professeurId: null });
                      }}
                    >
                      <option value="">Sélectionner...</option>
                      {plageHoraires.map((p) => (
                        <option key={p.id} value={p.id}>
                          {formatHeure(p.heure_debut)} - {formatHeure(p.heure_fin)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Professeur (optionnel)</label>
                    {!form.date || !form.plageHoraireId || !form.coursId ? (
                      <div style={{
                        padding: "12px",
                        backgroundColor: "#e3f2fd",
                        borderRadius: "4px",
                        fontSize: "0.9em",
                        color: "#1565c0"
                      }}>
                        ℹ️ Complétez la date, le cours et la plage horaire pour voir les professeurs disponibles
                      </div>
                    ) : (
                      <>
                        <select
                          value={form.professeurId || ""}
                          onChange={(e) =>
                            setForm({ ...form, professeurId: e.target.value ? Number(e.target.value) : null })
                          }
                        >
                          <option value="">Aucun</option>
                          {getCompatibleProfesseurs().map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.prenom} {p.nom} ({p.specialite_professeurs?.map(sp => sp.specialite?.nom).filter(Boolean).join(", ") || "N/A"})
                            </option>
                          ))}
                        </select>
                        {getCompatibleProfesseurs().length === 0 && (
                          <small style={{ color: "#dc3545", display: "block", marginTop: "4px", fontWeight: "bold" }}>
                            ❌ Aucun professeur compatible avec cette date/horaire
                          </small>
                        )}
                      </>
                    )}
                    {form.professeurId && !getCompatibleProfesseurs().find(p => p.id === form.professeurId) && (
                      <small style={{ color: "#dc3545", display: "block", marginTop: "4px" }}>
                        ⚠️ Ce professeur n'est pas disponible pour cette date/horaire
                      </small>
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                </div>
              </form>
            </div>
          </div>
          </>,
          document.body
        )}
    </div>
  );
}
