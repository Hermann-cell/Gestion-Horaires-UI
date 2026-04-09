import { useEffect, useMemo, useState } from "react";
import { getAllProfesseursWithPlanning } from "../api/professeurApi";

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

  useEffect(() => {
    const fetchPlanning = async () => {
      try {
        setLoading(true);
        const response = await getAllProfesseursWithPlanning();
        setProfesseurs(response.data || []);
      } catch (err) {
        setError("Erreur lors du chargement du planning.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlanning();
  }, []);

  const planningRows = useMemo(() => {
    return professeurs.flatMap((prof) => {
      const enseignant = `${prof.prenom || ""} ${prof.nom || ""}`.trim();

      const specialites =
        prof.specialite_professeurs
          ?.map((item) => item.specialite?.nom)
          .filter(Boolean)
          .join(", ") || "";

      return (prof.seances || []).map((seance) => ({
        enseignant,
        specialite: specialites,
        cours: seance.cours?.nom || "",
        codeCours: seance.cours?.code || "",
        salle: seance.salle?.code || seance.salle?.nom || "",
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
    return new Date(value).toLocaleDateString("fr-CA");
  };

  const formatTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleTimeString("fr-CA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="container mt-4">Chargement du planning...</div>;
  }

  if (error) {
    return <div className="container mt-4 alert alert-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Planning de tous les enseignants</h2>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">

            <div className="col-md-3">
              <label className="form-label">Enseignant</label>
              <input
                type="text"
                className="form-control"
                name="enseignant"
                value={filters.enseignant}
                onChange={handleChange}
                placeholder="Nom ou prénom"
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Spécialité</label>
              <input
                type="text"
                className="form-control"
                name="specialite"
                value={filters.specialite}
                onChange={handleChange}
                placeholder="Ex: Informatique"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Salle</label>
              <input
                type="text"
                className="form-control"
                name="salle"
                value={filters.salle}
                onChange={handleChange}
                placeholder="Ex: A101"
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Cours</label>
              <input
                type="text"
                className="form-control"
                name="cours"
                value={filters.cours}
                onChange={handleChange}
                placeholder="Ex: Algorithmique"
              />
            </div>


          </div>

          <div className="mt-3">
            <button className="btn btn-secondary" onClick={resetFilters}>
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <p>
            <strong>{filteredRows.length}</strong> séance(s) trouvée(s)
          </p>

          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>Enseignant</th>
                  <th>Spécialité</th>
                  <th>Cours</th>
                  <th>Salle</th>
                  <th>Date</th>
                  <th>Heure début</th>
                  <th>Heure fin</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length > 0 ? (
                  filteredRows.map((row, index) => (
                    <tr key={index}>
                      <td>{row.enseignant}</td>
                      <td>{row.specialite || "-"}</td>
                      <td>
                        {row.cours}
                        {row.codeCours ? ` (${row.codeCours})` : ""}
                      </td>
                      <td>{row.salle || "-"}</td>
                      <td>{formatDate(row.date)}</td>
                      <td>{formatTime(row.heureDebut)}</td>
                      <td>{formatTime(row.heureFin)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
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
  );
}