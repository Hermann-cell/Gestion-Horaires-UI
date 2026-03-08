import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/rooms.css";
import { FiSearch } from "react-icons/fi";
import RoomTable from "../components/RoomTable.jsx";

const emptyForm = {
  id: null,
  code: "",
  name: "",
  type: "Salle de cours",
  capacity: "",
  description: "",
};

const INITIAL_ROOMS = [
  {
    id: 1,
    code: "A101",
    name: "Salle A101",
    type: "Salle de cours",
    capacity: 40,
    description:
      "Salle standard destinée aux cours magistraux et travaux dirigés.",
  },
  {
    id: 2,
    code: "LAB01",
    name: "Laboratoire Info 1",
    type: "Laboratoire",
    capacity: 24,
    description:
      "Laboratoire équipé d’ordinateurs pour les travaux pratiques et démonstrations techniques.",
  },
  {
    id: 3,
    code: "AMPHI1",
    name: "Amphithéâtre Central",
    type: "Amphithéâtre",
    capacity: 120,
    description:
      "Grand amphithéâtre utilisé pour les cours à grand effectif et les présentations.",
  },
];

export default function Rooms() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("Tous");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const filteredRooms = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchQuery =
        !q ||
        room.code.toLowerCase().includes(q) ||
        room.name.toLowerCase().includes(q);

      const matchType = typeFilter === "Tous" ? true : room.type === typeFilter;

      return matchQuery && matchType;
    });
  }, [rooms, query, typeFilter]);

  const closeModal = () => setOpen(false);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openCreateModal = () => {
    setFormError("");
    setMode("create");
    setForm(emptyForm);
    setOpen(true);
  };

  const openEditModal = (room) => {
    setFormError("");
    setMode("edit");
    setForm({
      id: room.id,
      code: room.code ?? "",
      name: room.name ?? "",
      type: room.type ?? "Salle de cours",
      capacity: room.capacity ?? "",
      description: room.description ?? "",
    });
    setOpen(true);
  };

  const handleDelete = (id) => {
    const ok = window.confirm("Voulez-vous supprimer cette salle ?");
    if (!ok) return;

    setRooms((prev) => prev.filter((room) => room.id !== id));
  };

  const handleView = (room) => {
    navigate(`/app/rooms/${room.id}`, {
      state: { room },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    const codeTrim = form.code.trim();
    const nameTrim = form.name.trim();
    const descriptionTrim = form.description.trim();
    const capacityValue = Number(form.capacity);

    if (!codeTrim || !nameTrim || !form.type || form.capacity === "") {
      setFormError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (!Number.isInteger(capacityValue) || capacityValue <= 0) {
      setFormError("La capacité doit être un nombre entier positif.");
      return;
    }

    if (mode === "create") {
      const exists = rooms.some(
        (room) => room.code.toLowerCase() === codeTrim.toLowerCase()
      );

      if (exists) {
        setFormError("Ce code de salle existe déjà.");
        return;
      }

      const newRoom = {
        id: Date.now(),
        code: codeTrim,
        name: nameTrim,
        type: form.type,
        capacity: capacityValue,
        description: descriptionTrim,
      };

      setRooms((prev) => [newRoom, ...prev]);
      setOpen(false);
      setForm(emptyForm);
      return;
    }

    const duplicateCode = rooms.some(
      (room) =>
        room.id !== form.id &&
        room.code.toLowerCase() === codeTrim.toLowerCase()
    );

    if (duplicateCode) {
      setFormError("Ce code de salle existe déjà.");
      return;
    }

    setRooms((prev) =>
      prev.map((room) =>
        room.id === form.id
          ? {
              ...room,
              code: codeTrim,
              name: nameTrim,
              type: form.type,
              capacity: capacityValue,
              description: descriptionTrim,
            }
          : room
      )
    );

    setOpen(false);
    setForm(emptyForm);
  };

  useEffect(() => {
    const onKey = (ev) => ev.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="rooms-page">
      <div className="rooms-container">
        <p className="rooms-subtitle">
          Créer, filtrer et gérer les salles.
        </p>

        <div className="rooms-filters-card">
          <div className="rooms-filters-grid">
            <div className="filter-group">
              <label>Code de salle</label>
              <div className="search-box">
                <FiSearch />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Entrez le code"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Type salle</label>
              <select
                className="type-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="Tous">Tous les types</option>
                <option value="Salle de cours">Salle de cours</option>
                <option value="Laboratoire">Laboratoire</option>
                <option value="Amphithéâtre">Amphithéâtre</option>
              </select>
            </div>
          </div>

          <div className="rooms-actions">
            <button className="add-room-btn" onClick={openCreateModal}>
              + Ajouter une salle
            </button>
          </div>
        </div>

        <RoomTable
          rooms={filteredRooms}
          onDelete={handleDelete}
          onEdit={openEditModal}
          onView={handleView}
        />

        {open && (
          <div className="modal-overlay" onMouseDown={closeModal}>
            <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h3>
                  {mode === "edit"
                    ? "Modifier une salle"
                    : "Ajouter une salle"}
                </h3>

                <button
                  className="modal-close"
                  onClick={closeModal}
                  aria-label="Fermer"
                  type="button"
                >
                  ✕
                </button>
              </div>

              <form className="modal-form" onSubmit={handleSubmit}>
                <p className="required-note">
                  Les champs marqués d’une <span className="required-star">*</span> sont obligatoires.
                </p>

                <div className="modal-field">
                  <label>
                    <span className="required-star">*</span> Code
                  </label>
                  <input
                    value={form.code}
                    onChange={(e) => onChange("code", e.target.value)}
                    placeholder="Ex: A101"
                  />
                </div>

                <div className="modal-field">
                  <label>
                    <span className="required-star">*</span> Nom salle
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => onChange("name", e.target.value)}
                    placeholder="Ex: Salle Informatique 1"
                  />
                </div>

                <div className="modal-grid">
                  <div className="modal-field">
                    <label>
                      <span className="required-star">*</span> Type
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => onChange("type", e.target.value)}
                    >
                      <option value="Salle de cours">Salle de cours</option>
                      <option value="Laboratoire">Laboratoire</option>
                      <option value="Amphithéâtre">Amphithéâtre</option>
                    </select>
                  </div>

                  <div className="modal-field">
                    <label>
                      <span className="required-star">*</span> Capacité
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.capacity}
                      onChange={(e) => onChange("capacity", e.target.value)}
                      placeholder="Ex: 40"
                    />
                  </div>
                </div>

                <div className="modal-field">
                  <label>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => onChange("description", e.target.value)}
                    placeholder="Décrivez brièvement la salle, ses équipements ou son usage..."
                    rows="4"
                  />
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
      </div>
    </div>
  );
}