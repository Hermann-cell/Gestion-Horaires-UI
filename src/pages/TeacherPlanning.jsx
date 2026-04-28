import React, { useEffect, useMemo, useState } from "react";
import { getAllProfesseursWithPlanning } from "@/api/professeurApi";
import { successToast, errorToast } from "@/utils/toastServices.js";
import { FiCalendar, FiUsers, FiRefreshCw, FiSearch, FiFilter, FiList, FiGrid, FiDownload } from "react-icons/fi";
import { generateTeacherPlanningPDF } from "@/utils/generateTeacherPlanningPDF.js";
import "@/styles/calendar.css";
import "@/styles/rooms.css";

const JOURS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const HEURES = Array.from({ length: 14 }, (_, i) => i + 8);

export default function TeacherPlanning() {
  const [professeurs, setProfesseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [exportingPDF, setExportingPDF] = useState(false);

  const [filters, setFilters] = useState({
    enseignantSelect: "", // Sélection spécifique d'enseignant
    enseignant: "",
    specialite: "",
    salle: "",
    cours: "",
  });

  const loadPlanning = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllProfesseursWithPlanning();
      setProfesseurs(response.data || []);
    } catch (err) {
      const msg = err?.response?.data?.message || "Erreur lors du chargement du planning.";
      setError(msg);
      errorToast(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanning();
  }, []);

  const planningRows = useMemo(() => {
    return professeurs.flatMap((prof) => {
      const enseignant = `${prof.prenom || ""} ${prof.nom || ""}`.trim();
      const profId = prof.id;

      const specialites =
        prof.specialite_professeurs
          ?.map((item) => item.specialite?.nom)
          .filter(Boolean)
          .join(", ") || "N/A";

      return (prof.seances || []).map((seance) => ({
        profId,
        enseignant,
        specialite: specialites,
        cours: seance.cours?.nom || "N/A",
        codeCours: seance.cours?.code || "",
        salle: seance.salle?.code || seance.salle?.nom || "N/A",
        date: seance.date || "",
        heureDebut: seance.plageHoraire?.heure_debut || "",
        heureFin: seance.plageHoraire?.heure_fin || "",
      }));
    });
  }, [professeurs]);

  // Extraire la liste unique des enseignants pour le dropdown
  const enseignantsList = useMemo(() => {
    const unique = new Map();
    professeurs.forEach((prof) => {
      const name = `${prof.prenom || ""} ${prof.nom || ""}`.trim();
      if (!unique.has(prof.id)) {
        unique.set(prof.id, { id: prof.id, name });
      }
    });
    return Array.from(unique.values());
  }, [professeurs]);

  const filteredRows = useMemo(() => {
    let rows = planningRows;

    // Si un enseignant est sélectionné, filtrer uniquement ses séances
    if (filters.enseignantSelect) {
      const selectedProfId = parseInt(filters.enseignantSelect);
      rows = rows.filter((row) => row.profId === selectedProfId);
    }

    return rows.filter((row) => {
      const matchEnseignant =
        !filters.enseignant ||
        row.enseignant.toLowerCase().includes(filters.enseignant.toLowerCase());

      const matchSpecialite =
        !filters.specialite ||
        row.specialite.toLowerCase().includes(filters.specialite.toLowerCase());

      const matchSalle =
        !filters.salle ||
        row.salle.toLowerCase().includes(filters.salle.toLowerCase());

      const matchCours =
        !filters.cours ||
        row.cours.toLowerCase().includes(filters.cours.toLowerCase()) ||
        row.codeCours.toLowerCase().includes(filters.cours.toLowerCase());

      return matchSalle && matchCours && matchEnseignant && matchSpecialite;
    });
  }, [planningRows, filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      enseignantSelect: "",
      enseignant: "",
      specialite: "",
      salle: "",
      cours: "",
    });
  };

  const handleExportPDF = async () => {
    const selectedProfId = parseInt(filters.enseignantSelect);
    if (!selectedProfId) {
      errorToast("Veuillez sélectionner un enseignant pour exporter");
      return;
    }

    const selectedProf = professeurs.find((p) => p.id === selectedProfId);
    if (!selectedProf) {
      errorToast("Enseignant non trouvé");
      return;
    }

    try {
      setExportingPDF(true);

      const enseignantName = `${selectedProf.prenom || ""} ${selectedProf.nom || ""}`.trim();
      const specialites =
        selectedProf.specialite_professeurs
          ?.map((item) => item.specialite?.nom)
          .filter(Boolean)
          .join(", ") || "Non assignée";

      // Extraire les séances de cet enseignant
      const seances = filteredRows.map((row) => ({
        date: row.date,
        heureDebut: row.heureDebut,
        heureFin: row.heureFin,
        cours: row.cours,
        codeCours: row.codeCours,
        salle: row.salle,
      }));

      const filename = `Planning_${enseignantName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

      await generateTeacherPlanningPDF(
        enseignantName,
        specialites,
        seances,
        filename
      );

      successToast(`PDF exporté: ${filename}`);
    } catch (err) {
      console.error("Erreur export PDF:", err);
      errorToast("Erreur lors de l'exportation du PDF");
    } finally {
      setExportingPDF(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("fr-CA", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleTimeString("fr-CA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSeancesForSlot = (jour, heure) => {
    return filteredRows.filter((row) => {
      if (!row.date || !row.heureDebut) return false;
      
      const rowDate = new Date(row.date);
      const rowDay = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"][rowDate.getDay()];
      
      const heureDebut = new Date(row.heureDebut);
      const rowHeure = heureDebut.getHours();
      
      return rowDay === jour && rowHeure === heure;
    });
  };

  const renderCalendarView = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    return (
      <div style={{ overflowX: "auto", marginBottom: "2rem", WebkitOverflowScrolling: "touch" }}>
        <div className="calendar-container" style={{ minWidth: isMobile ? "1200px" : "100%" }}>
          <div className="calendar-grid-v2" style={{
            display: "grid",
            gridTemplateColumns: `${isMobile ? "60px" : "80px"} repeat(6, ${isMobile ? "140px" : "1fr"})`,
            gap: "1px",
            backgroundColor: "#e3e6f0",
            padding: "1px",
            borderRadius: "8px",
            overflow: "hidden",
          }}>
            {/* Header avec les jours */}
            <div style={{
              padding: isMobile ? "8px 4px" : "12px 8px",
              backgroundColor: "#1f3f8a",
              color: "white",
              fontWeight: "bold",
              fontSize: isMobile ? "10px" : "12px",
              textAlign: "center",
              minHeight: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              Heure
            </div>
            {JOURS.map((jour) => (
              <div
                key={jour}
                style={{
                  padding: isMobile ? "8px 4px" : "12px 8px",
                  backgroundColor: "#1f3f8a",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: isMobile ? "11px" : "13px",
                  textAlign: "center",
                  textTransform: "capitalize",
                  minHeight: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  wordBreak: "break-word",
                }}
              >
                {isMobile ? jour.substring(0, 3) : jour}
              </div>
            ))}

            {/* Slots horaires */}
            {HEURES.map((heure) => (
              <React.Fragment key={heure}>
                <div
                  style={{
                    padding: isMobile ? "8px 4px" : "12px 8px",
                    backgroundColor: "#f0f3f8",
                    color: "#1f3f8a",
                    fontWeight: "bold",
                    fontSize: isMobile ? "9px" : "12px",
                    textAlign: "center",
                    borderRight: "1px solid #e3e6f0",
                    minHeight: isMobile ? "70px" : "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    wordBreak: "break-word",
                  }}
                >
                  {isMobile ? `${heure}h` : `${heure}h-${heure + 1}h`}
                </div>

                {JOURS.map((jour) => {
                  const seances = getSeancesForSlot(jour, heure);
                  return (
                    <div
                      key={`${jour}-${heure}`}
                      style={{
                        padding: isMobile ? "6px 4px" : "8px",
                        backgroundColor: seances.length > 0 ? "#e7f1ff" : "white",
                        minHeight: isMobile ? "70px" : "80px",
                        borderRight: "1px solid #e3e6f0",
                        fontSize: isMobile ? "8px" : "11px",
                        overflow: "auto",
                        maxHeight: "120px",
                      }}
                    >
                      {seances.map((seance, idx) => (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: "#4e73df",
                            color: "white",
                            padding: isMobile ? "4px 5px" : "6px 8px",
                            borderRadius: "3px",
                            marginBottom: isMobile ? "2px" : "4px",
                            lineHeight: "1.2",
                            fontSize: isMobile ? "8px" : "11px",
                          }}
                        >
                          <div className="fw-bold" style={{ fontSize: isMobile ? "8px" : "11px", marginBottom: "2px" }}>
                            {isMobile ? seance.cours.substring(0, 10) + (seance.cours.length > 10 ? "..." : "") : seance.cours}
                          </div>
                          {seance.codeCours && !isMobile && (
                            <div style={{ fontSize: "9px", opacity: 0.9 }}>
                              {seance.codeCours}
                            </div>
                          )}
                          {!isMobile && (
                            <div style={{ fontSize: "9px", opacity: 0.85 }}>
                              Salle: {seance.salle}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="rooms-page">
        <div className="rooms-container">
          <div className="text-center py-5">
            <div className="spinner-border mb-3" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p>Chargement du planning des enseignants...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rooms-page">
      <div className="rooms-container">
        <div className="room-detail-card">
          <div className="room-detail-head border-bottom pb-3 mb-4">
            <div className="d-flex align-items-center gap-2">
              <FiCalendar size={28} className="text-primary" />
              <h2 className="mb-0">Planning des enseignants</h2>
            </div>
            <p className="text-muted mb-0">Consultez les séances assignées à tous les enseignants</p>
          </div>

          {error && (
            <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
              <strong>Erreur!</strong> {error}
              <button type="button" className="btn-close" onClick={() => setError("")}></button>
            </div>
          )}

          {/* Filters Card */}
          <div className="card shadow-sm mb-4" style={{ border: "1px solid #e3e6f0" }}>
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 mb-3">
                <FiFilter size={18} className="text-secondary" />
                <h6 className="mb-0 fw-bold">Filtres & Export</h6>
              </div>

              <div className="row g-3">
                <div className="col-md-6 col-lg-2">
                  <label className="form-label fw-500">Enseignant *</label>
                  <select
                    className="form-control"
                    name="enseignantSelect"
                    value={filters.enseignantSelect}
                    onChange={handleChange}
                    style={{
                      borderColor: filters.enseignantSelect ? "#4e73df" : "#cbd5e1",
                      backgroundColor: filters.enseignantSelect ? "#f0f4ff" : "white",
                    }}
                  >
                    <option value="">-- Sélectionner --</option>
                    {enseignantsList.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.name}
                      </option>
                    ))}
                  </select>
                  <small className="text-muted">Pour exporter</small>
                </div>

                <div className="col-md-6 col-lg-2">
                  <label className="form-label fw-500">Filtre: Enseignant</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">
                      <FiUsers size={16} className="text-secondary" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-0 bg-light"
                      name="enseignant"
                      value={filters.enseignant}
                      onChange={handleChange}
                      placeholder="Nom/prénom"
                    />
                  </div>
                </div>

                <div className="col-md-6 col-lg-2">
                  <label className="form-label fw-500">Filtre: Spécialité</label>
                  <input
                    type="text"
                    className="form-control bg-light border-0"
                    name="specialite"
                    value={filters.specialite}
                    onChange={handleChange}
                    placeholder="Ex: Info"
                  />
                </div>

                <div className="col-md-6 col-lg-2">
                  <label className="form-label fw-500">Filtre: Salle</label>
                  <input
                    type="text"
                    className="form-control bg-light border-0"
                    name="salle"
                    value={filters.salle}
                    onChange={handleChange}
                    placeholder="Ex: A101"
                  />
                </div>

                <div className="col-md-6 col-lg-2">
                  <label className="form-label fw-500">Filtre: Cours</label>
                  <input
                    type="text"
                    className="form-control bg-light border-0"
                    name="cours"
                    value={filters.cours}
                    onChange={handleChange}
                    placeholder="Ex: Algo"
                  />
                </div>
              </div>

              <div className="mt-3 d-flex gap-2 flex-wrap">
                <button 
                  className="btn btn-outline-secondary"
                  onClick={resetFilters}
                >
                  Réinitialiser
                </button>

                {/* <button 
                  className="btn btn-outline-primary"
                  onClick={loadPlanning}
                >
                  <FiRefreshCw size={16} className="me-1" /> Rafraîchir
                </button> */}

                <button 
                  className="btn btn-success"
                  onClick={handleExportPDF}
                  disabled={exportingPDF || !filters.enseignantSelect}
                  title={!filters.enseignantSelect ? "Sélectionnez d'abord un enseignant" : "Exporter le planning en PDF"}
                  style={{ marginLeft: "auto" }}
                >
                  <FiDownload size={16} className="me-1" /> 
                  {exportingPDF ? "Génération..." : "Export PDF"}
                </button>
                <div className="d-flex gap-2">
                  <button
                    className={`btn ${viewMode === "table" ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => setViewMode("table")}
                    title="Vue tableau"
                  >
                    <FiList size={16} className="me-1" /> Tableau
                  </button>
                  <button
                    className={`btn ${viewMode === "calendar" ? "btn-primary" : "btn-outline-secondary"}`}
                    onClick={() => setViewMode("calendar")}
                    title="Vue calendrier"
                  >
                    <FiGrid size={16} className="me-1" /> Calendrier
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Card */}
          <div className="card shadow-sm" style={{ border: "1px solid #e3e6f0" }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                  <h6 className="mb-1">
                    {viewMode === "table" ? "Vue Tableau" : "Vue Calendrier"}
                  </h6>
                  <p className="text-muted mb-0">
                    <strong>{filteredRows.length}</strong> séance(s) trouvée(s)
                    {planningRows.length > filteredRows.length && 
                      ` / ${planningRows.length} au total`
                    }
                  </p>
                </div>
              </div>

              {/* Vue Tableau */}
              {viewMode === "table" && (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th scope="col" className="fw-bold">Enseignant</th>
                        <th scope="col" className="fw-bold">Spécialité</th>
                        <th scope="col" className="fw-bold">Cours</th>
                        <th scope="col" className="fw-bold">Salle</th>
                        <th scope="col" className="fw-bold">Date</th>
                        <th scope="col" className="fw-bold">Heure début</th>
                        <th scope="col" className="fw-bold">Heure fin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.length > 0 ? (
                        filteredRows.map((row, index) => (
                          <tr key={index} style={{ borderBottom: "1px solid #e3e6f0" }}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="avatar-sm rounded-circle bg-primary-light text-primary d-flex align-items-center justify-content-center fw-bold"
                                  style={{ width: "32px", height: "32px", backgroundColor: "#e7f1ff" }}
                                >
                                  {row.enseignant?.charAt(0)?.toUpperCase() || "P"}
                                </div>
                                <span>{row.enseignant}</span>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-info-light text-info" style={{ backgroundColor: "#e3f2fd" }}>
                                {row.specialite}
                              </span>
                            </td>
                            <td>
                              <strong>{row.cours}</strong>
                              {row.codeCours && (
                                <div className="text-muted small">{row.codeCours}</div>
                              )}
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">{row.salle}</span>
                            </td>
                            <td>{formatDate(row.date)}</td>
                            <td className="fw-bold text-success">{formatTime(row.heureDebut)}</td>
                            <td className="fw-bold text-danger">{formatTime(row.heureFin)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-5 text-muted">
                            <FiSearch size={32} className="mb-2 d-block mx-auto opacity-50" />
                            Aucun résultat trouvé
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Vue Calendrier */}
              {viewMode === "calendar" && (
                <>
                  {filteredRows.length > 0 ? (
                    renderCalendarView()
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <FiSearch size={32} className="mb-2 d-block mx-auto opacity-50" />
                      Aucun résultat trouvé
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}