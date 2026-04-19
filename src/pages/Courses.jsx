import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/rooms.css";
import { FiSearch } from "react-icons/fi";
import DataTable from "../components/DataTable.jsx";
import * as coursApi from "../api/coursApi";
import * as specialiteApi from "../api/specialiteApi";
import * as programmeApi from "../api/programmeApi";
import { ToastContainer, toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.css";

const emptyForm = { id: null, code: "", nom: "", duree: "", etape: "", specialiteId: "", programmeId: "" };

const successToast = (msg) =>
  toast.success(msg, { position: "top-right", autoClose: 3000 });
const errorToast = (msg) =>
  toast.error(msg, { position: "top-right", autoClose: 3000 });

export default function Courses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [query, setQuery] = useState("");
  const [filterSpecialite, setFilterSpecialite] = useState("");
  const [filterProgramme, setFilterProgramme] = useState("");
  const [filterEtape, setFilterEtape] = useState("");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // -------------------------------
  // Charger les cours, spécialités et programmes
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
        specialite: c.specialite,
        typeDeSalle: c.typeDeSalle,
        cours_programmes: c.cours_programmes || [],
      }));

      setCourses(formatted);
    } catch (err) {
      console.error(err);
      setCourses([]);
      errorToast("Erreur lors du chargement des cours");
    }
  };

  const loadSpecialites = async () => {
    try {
      const res = await specialiteApi.getSpecialites();
      const data = Array.isArray(res) ? res : res.data;
      setSpecialites(data || []);
    } catch (err) {
      console.error("Erreur chargement spécialités", err);
      setSpecialites([]);
    }
  };

  const loadProgrammes = async () => {
    try {
      const res = await programmeApi.getProgrammes();
      const data = Array.isArray(res) ? res : res.data;
      setProgrammes(data || []);
    } catch (err) {
      console.error("Erreur chargement programmes", err);
      setProgrammes([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadCourses(), loadSpecialites(), loadProgrammes()]);
    };

    void init();
  }, []);

  // -------------------------------
  // Filtrage
  // -------------------------------
  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((c) => {
      const matchQuery =
        !q ||
        c.code.toLowerCase().includes(q) ||
        c.nom.toLowerCase().includes(q);

      const matchSpecialite =
        !filterSpecialite ||
        (c.specialite && c.specialite.id === parseInt(filterSpecialite));

      const matchProgramme =
        !filterProgramme ||
        (c.cours_programmes &&
          c.cours_programmes.some(
            (cp) => cp.programme && cp.programme.id === parseInt(filterProgramme)
          ));

      const matchEtape =
        !filterEtape || c.etape === parseInt(filterEtape);

      return matchQuery && matchSpecialite && matchProgramme && matchEtape;
    });
  }, [courses, query, filterSpecialite, filterProgramme, filterEtape]);

  // -------------------------------
  // Colonnes DataTable
  // -------------------------------
  const columns = [
    { key: "code", label: "Code" },
    { key: "nom", label: "Nom" },
    { key: "duree", label: "Durée" },
    { key: "etape", label: "Étape" },
    {
      key: "specialite",
      label: "Spécialité",
      render: (row) => row.specialite?.nom || "-",
    },
    {
      key: "programmes",
      label: "Programmes",
      render: (row) =>
        row.cours_programmes && row.cours_programmes.length > 0
          ? row.cours_programmes.map((cp) => cp.programme?.nom).join(", ")
          : "-",
    },
  ];

  // -------------------------------
  // Modal
  // -------------------------------
  const closeModal = () => setOpen(false);

  const onChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreateModal = () => {
    setFormError("");
    setMode("create");
    setForm(emptyForm);
    setOpen(true);
  };

  const openEditModal = (course) => {
    setFormError("");
    setMode("edit");
    setForm({
      id: course.id,
      code: course.code,
      nom: course.nom,
      duree: course.duree,
      etape: course.etape,
      specialiteId: course.specialite?.id || "",
      programmeId:
        (course.cours_programmes && course.cours_programmes[0]?.programme?.id) ||
        "",
    });
    setOpen(true);
  };

  // -------------------------------
  // Delete
  // -------------------------------
  const handleDelete = (id) => {
    const selectedCourse = courses.find((c) => c.id === id) || null;
    setCourseToDelete(selectedCourse);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCourseToDelete(null);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      await coursApi.deleteCours(courseToDelete.id);
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      successToast("Cours supprimé avec succès !");
      closeDeleteModal();
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

    const payload = {
      code: codeTrim,
      nom: nomTrim,
      duree: dureeVal,
      etape: etapeVal,
      specialiteId: form.specialiteId ? parseInt(form.specialiteId) : null,
      typeDeSalleId: null,
    };

    try {
      if (mode === "create") {
        await coursApi.createCours(payload);
        successToast("Cours créé avec succès !");
      } else {
        await coursApi.updateCours(form.id, payload);
        successToast("Cours modifié avec succès !");
      }

      await loadCourses();

      setOpen(false);
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      setFormError(
        mode === "create"
          ? "Erreur lors de la création."
          : "Erreur lors de la modification."
      );
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

            <div className="filter-group">
              <label>Spécialité</label>
              <select
                value={filterSpecialite}
                onChange={(e) => setFilterSpecialite(e.target.value)}
              >
                <option value="">Toutes les spécialités</option>
                {specialites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Programme</label>
              <select
                value={filterProgramme}
                onChange={(e) => setFilterProgramme(e.target.value)}
              >
                <option value="">Tous les programmes</option>
                {programmes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Étape</label>
              <select
                value={filterEtape}
                onChange={(e) => setFilterEtape(e.target.value)}
              >
                <option value="">Toutes les étapes</option>
                {[1, 2, 3, 4, 5].map((etape) => (
                  <option key={etape} value={etape}>
                    Étape {etape}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rooms-actions">
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => {
                setQuery("");
                setFilterSpecialite("");
                setFilterProgramme("");
                setFilterEtape("");
              }}
              style={{ marginRight: "10px" }}
            >
              Réinitialiser filtres
            </button>
            <button className="add-room-btn" onClick={openCreateModal}>
              + Ajouter un cours
            </button>
          </div>
        </div>

        <DataTable
          data={filteredCourses}
          columns={columns}
          onDelete={handleDelete}
          onEdit={openEditModal}
          onView={handleView}
        />

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
                  Les champs marqués d’une{" "}
                  <span className="required-star">*</span> sont obligatoires.
                </p>

                <div className="modal-field">
                  <label>
                    <span className="required-star">*</span> Code
                  </label>
                  <input
                    value={form.code}
                    onChange={(e) => onChange("code", e.target.value)}
                    placeholder="Ex: INF101"
                  />
                </div>

                <div className="modal-field">
                  <label>
                    <span className="required-star">*</span> Nom
                  </label>
                  <input
                    value={form.nom}
                    onChange={(e) => onChange("nom", e.target.value)}
                    placeholder="Ex: Algorithmique"
                  />
                </div>

                <div className="modal-grid">
                  <div className="modal-field">
                    <label>
                      <span className="required-star">*</span> Durée
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.duree}
                      onChange={(e) => onChange("duree", e.target.value)}
                    />
                  </div>

                  <div className="modal-field">
                    <label>
                      <span className="required-star">*</span> Étape
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.etape}
                      onChange={(e) => onChange("etape", e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-grid">
                  <div className="modal-field">
                    <label>Spécialité</label>
                    <select
                      value={form.specialiteId}
                      onChange={(e) => onChange("specialiteId", e.target.value)}
                    >
                      <option value="">Aucune spécialité</option>
                      {specialites.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="modal-field">
                    <label>Programme</label>
                    <select
                      value={form.programmeId}
                      onChange={(e) => onChange("programmeId", e.target.value)}
                    >
                      <option value="">Aucun programme</option>
                      {programmes.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formError && <div className="modal-error">{formError}</div>}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={closeModal}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    {mode === "edit" ? "Enregistrer" : "Créer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Supprimer un cours</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            Voulez-vous supprimer le cours{" "}
            <strong>
              {courseToDelete?.code} - {courseToDelete?.nom}
            </strong>{" "}
            ?
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={closeDeleteModal}>
              Annuler
            </Button>

            <Button variant="danger" onClick={confirmDeleteCourse}>
              Supprimer
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}