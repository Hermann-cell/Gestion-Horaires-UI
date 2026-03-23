import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/rooms.css";
import { FiSearch } from "react-icons/fi";
import DataTable from "../components/DataTable.jsx";
import * as coursApi from "../api/coursApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const emptyForm = { id: null, code: "", nom: "", duree: "", etape: "" };

const successToast = (msg) => toast.success(msg, { position: "top-right", autoClose: 3000 });
const errorToast = (msg) => toast.error(msg, { position: "top-right", autoClose: 3000 });

export default function Courses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  // -------------------------------
  // Charger les cours
  // -------------------------------
  const loadCourses = async () => {
    try {
      const res = await coursApi.getCours();
      const data = Array.isArray(res) ? res : res.data;

      const formatted = data.map((c) => ({
        id: c.id,
        code: c.code,
        nom: c.nom,
        duree: c.duree,
        etape: c.etape,
        est_harchive: c.est_harchive,
      }));

      setCourses(formatted);
    } catch (err) {
      console.error(err);
      setCourses([]);
      errorToast("Erreur lors du chargement des cours");
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // -------------------------------
  // Filtrage
  // -------------------------------
  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter(
      (c) =>
        !q ||
        c.code.toLowerCase().includes(q) ||
        c.nom.toLowerCase().includes(q)
    );
  }, [courses, query]);

  // -------------------------------
  // Colonnes DataTable
  // -------------------------------
  const columns = [
    { key: "code", label: "Code" },
    { key: "nom", label: "Nom" },
    { key: "duree", label: "Durée" },
    { key: "etape", label: "Étape" },
  ];

  // -------------------------------
  // Modal
  // -------------------------------
  const closeModal = () => setOpen(false);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const openCreateModal = () => {
    setFormError("");
    setMode("create");
    setForm(emptyForm);
    setOpen(true);
  };

  const openEditModal = (course) => {
    setFormError("");
    setMode("edit");
    setForm({ ...course });
    setOpen(true);
  };

  // -------------------------------
  // Delete
  // -------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous supprimer ce cours ?")) return;

    try {
      await coursApi.deleteCours(id);
      // Rafraîchir la liste après suppression
      setCourses((prev) => prev.filter((c) => c.id !== id));
      successToast("Cours supprimé avec succès !");
    } catch (err) {
      console.error(err);
      errorToast("Erreur lors de la suppression");
    }
  };

  // -------------------------------
  // View
  // -------------------------------
  const handleView = (course) => {
    navigate(`/courses/${course.id}`, { state: { course } });
  };

  // -------------------------------
  // Submit
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const codeTrim = form.code.trim();
    const nomTrim = form.nom.trim();
    const dureeVal = Number(form.duree);
    const etapeVal = Number(form.etape);

    if (!codeTrim || !nomTrim || !form.duree || !form.etape) {
      setFormError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (!Number.isInteger(dureeVal) || dureeVal <= 0) {
      setFormError("La durée doit être un entier positif.");
      return;
    }
    if (!Number.isInteger(etapeVal) || etapeVal <= 0) {
      setFormError("L'étape doit être un entier positif.");
      return;
    }

    const payload = { code: codeTrim, nom: nomTrim, duree: dureeVal, etape: etapeVal };

    try {
      let res;

      if (mode === "create") {
        res = await coursApi.createCours(payload);
        successToast("Cours créé avec succès !");
      } else {
        res = await coursApi.updateCours(form.id, payload);
        successToast("Cours modifié avec succès !");
      }

      // 🔹 Rafraîchir la liste complète après create/update
      await loadCourses();

      // Reset modal
      setOpen(false);
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      setFormError(mode === "create" ? "Erreur lors de la création." : "Erreur lors de la modification.");
      errorToast("Erreur lors de l'opération");
    }
  };

  // -------------------------------
  // ESC fermer modal
  // -------------------------------
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // -------------------------------
  // RENDER
  // -------------------------------
  return (
    <div className="rooms-page">
      <ToastContainer />
      <div className="rooms-container">
        <p className="rooms-subtitle">Créer, filtrer et gérer les cours.</p>

        {/* FILTRES */}
        <div className="rooms-filters-card">
          <div className="rooms-filters-grid">
            <div className="filter-group">
              <label>Code / Nom</label>
              <div className="search-box">
                <FiSearch />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher..."
                />
              </div>
            </div>
          </div>

          <div className="rooms-actions">
            <button className="add-room-btn" onClick={openCreateModal}>
              + Ajouter un cours
            </button>
          </div>
        </div>

        {/* TABLE */}
        <DataTable
          data={filteredCourses}
          columns={columns}
          onDelete={handleDelete}
          onEdit={openEditModal}
          onView={handleView}
        />

        {/* MODAL */}
        {open && (
          <div className="modal-overlay" onMouseDown={closeModal}>
            <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h3>{mode === "edit" ? "Modifier un cours" : "Ajouter un cours"}</h3>
                <button className="modal-close" onClick={closeModal}>
                  ✕
                </button>
              </div>

              <form className="modal-form" onSubmit={handleSubmit}>
                <p className="required-note">
                  Les champs marqués d’une <span className="required-star">*</span> sont obligatoires.
                </p>

                <div className="modal-field">
                  <label><span className="required-star">*</span> Code</label>
                  <input value={form.code} onChange={(e) => onChange("code", e.target.value)} placeholder="Ex: INF101" />
                </div>

                <div className="modal-field">
                  <label><span className="required-star">*</span> Nom</label>
                  <input value={form.nom} onChange={(e) => onChange("nom", e.target.value)} placeholder="Ex: Algorithmique" />
                </div>

                <div className="modal-grid">
                  <div className="modal-field">
                    <label><span className="required-star">*</span> Durée</label>
                    <input type="number" min="1" value={form.duree} onChange={(e) => onChange("duree", e.target.value)} />
                  </div>

                  <div className="modal-field">
                    <label><span className="required-star">*</span> Étape</label>
                    <input type="number" min="1" value={form.etape} onChange={(e) => onChange("etape", e.target.value)} />
                  </div>
                </div>

                {formError && <div className="modal-error">{formError}</div>}

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeModal}>Annuler</button>
                  <button type="submit" className="btn-primary">{mode === "edit" ? "Enregistrer" : "Créer"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}