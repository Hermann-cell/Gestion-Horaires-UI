import { useEffect, useMemo, useState } from "react";
import { getAllProfesseursWithPlanning } from "../api/professeurApi";
import { successToast, errorToast } from "../utils/toastServices.js";
import { FiCalendar, FiUsers, FiRefreshCw, FiSearch, FiFilter } from "react-icons/fi";
import "../styles/calendar.css";
import "../styles/rooms.css";

export default function TeacherPlanning() {
  const [professeurs, setProfesseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
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

      const specialites =
        prof.specialite_professeurs
          ?.map((item) => item.specialite?.nom)
          .filter(Boolean)
          .join(", ") || "N/A";

      return (prof.seances || []).map((seance) => ({
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

  const filteredRows = useMemo(() => {
    return planningRows.filter((row) => {
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
      salle: "",
      cours: "",
      enseignant: "",
      specialite: "",
    });
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
                <h6 className="mb-0 fw-bold">Filtres</h6>
              </div>

              <div className="row g-3">
                <div className="col-md-6 col-lg-3">
                  <label className="form-label fw-500">Enseignant</label>
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
                      placeholder="Nom ou prénom"
                    />
                  </div>
                </div>

                <div className="col-md-6 col-lg-3">
                  <label className="form-label fw-500">Spécialité</label>
                  <input
                    type="text"
                    className="form-control bg-light border-0"
                    name="specialite"
                    value={filters.specialite}
                    onChange={handleChange}
                    placeholder="Ex: Informatique"
                  />
                </div>

                <div className="col-md-6 col-lg-3">
                  <label className="form-label fw-500">Salle</label>
                  <input
                    type="text"
                    className="form-control bg-light border-0"
                    name="salle"
                    value={filters.salle}
                    onChange={handleChange}
                    placeholder="Ex: A101"
                  />
                </div>

                <div className="col-md-6 col-lg-3">
                  <label className="form-label fw-500">Cours</label>
                  <input
                    type="text"
                    className="form-control bg-light border-0"
                    name="cours"
                    value={filters.cours}
                    onChange={handleChange}
                    placeholder="Ex: Algorithmique"
                  />
                </div>
              </div>

              <div className="mt-3 d-flex gap-2">
                <button 
                  className="btn btn-outline-secondary"
                  onClick={resetFilters}
                >
                  Réinitialiser
                </button>
                <button 
                  className="btn btn-outline-primary"
                  onClick={loadPlanning}
                >
                  <FiRefreshCw size={16} className="me-1" /> Rafraîchir
                </button>
              </div>
            </div>
          </div>

          {/* Results Card */}
          <div className="card shadow-sm" style={{ border: "1px solid #e3e6f0" }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6 className="mb-1">Résultats</h6>
                  <p className="text-muted mb-0">
                    <strong>{filteredRows.length}</strong> séance(s) trouvée(s)
                    {planningRows.length > filteredRows.length && 
                      ` / ${planningRows.length} au total`
                    }
                  </p>
                </div>
              </div>

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}