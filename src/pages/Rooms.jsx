// src/pages/Rooms.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/rooms.css";
import { FiSearch } from "react-icons/fi";
import RoomTable from "../components/RoomTable.jsx";
import * as salleApi from "../api/salleApi";
import { ToastContainer, toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.css";

// Formulaire vide
const emptyForm = {
  id: null,
  code: "",
  name: "",
  typeDeSalleId: 1,
  capacity: "",
  description: "",
};

// Toasts
const successToast = (msg) =>
  toast.success(msg, { position: "top-right", autoClose: 3000 });
const errorToast = (msg) =>
  toast.error(msg, { position: "top-right", autoClose: 3000 });

export default function Rooms() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("Tous");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  useEffect(() => {
    async function loadRooms() {
      try {
        const res = await salleApi.getSalles();
        const roomsArray = Array.isArray(res) ? res : res.data;
        const formattedRooms = roomsArray.map((room) => ({
          id: room.id,
          code: room.code,
          name: room.nom,
          typeDeSalleId: room.typeDeSalle?.id,
          type: room.typeDeSalle?.nom || "",
          capacity: room.capacite,
          description: room.description || "",
        }));
        setRooms(formattedRooms);
      } catch (err) {
        console.error("Erreur chargement salles", err);
        setRooms([]);
        errorToast("Erreur lors du chargement des salles");
      }
    }
    loadRooms();
  }, []);

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
  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

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
      typeDeSalleId: room.typeDeSalleId ?? 1,
      type: room.type ?? "Salle de cours",
      capacity: room.capacity ?? "",
      description: room.description ?? "",
    });
    setOpen(true);
  };

  const handleDelete = (id) => {
    const selectedRoom = rooms.find((room) => room.id === id) || null;
    setRoomToDelete(selectedRoom);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setRoomToDelete(null);
  };

  const confirmDeleteRoom = async () => {
    if (!roomToDelete) return;

    try {
      await salleApi.deleteSalle(roomToDelete.id, {});
      setRooms((prev) => prev.filter((room) => room.id !== roomToDelete.id));
      successToast("Salle supprimée avec succès !");
      closeDeleteModal();
    } catch (err) {
      console.error(err);
      errorToast("Erreur lors de la suppression.");
    }
  };

  const handleView = (room) => {
    navigate(`/rooms/${room.id}`, { state: { room } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const codeTrim = form.code.trim();
    const nameTrim = form.name.trim();
    const descriptionTrim = form.description.trim();
    const capacityValue = Number(form.capacity);

    if (!codeTrim || !nameTrim || !form.typeDeSalleId || form.capacity === "") {
      setFormError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (!Number.isInteger(capacityValue) || capacityValue <= 0) {
      setFormError("La capacité doit être un nombre entier positif.");
      return;
    }

    const payload = {
      code: codeTrim,
      nom: nameTrim,
      capacite: capacityValue,
      description: descriptionTrim,
      typeDeSalleId: Number(form.typeDeSalleId),
    };

    try {
      if (mode === "create") {
        const res = await salleApi.createSalle(payload);
        const newRoom = {
          id: res.id,
          code: res.code,
          name: res.nom,
          typeDeSalleId: res.typeDeSalle?.id,
          type: res.typeDeSalle?.nom || form.type,
          capacity: res.capacite,
          description: res.description,
        };
        setRooms((prev) => [newRoom, ...prev]);
        successToast("Salle créée avec succès !");
      } else {
        const res = await salleApi.updateSalle(form.id, payload);
        setRooms((prev) =>
          prev.map((room) =>
            room.id === form.id
              ? {
                  id: res.id,
                  code: res.code,
                  name: res.nom,
                  typeDeSalleId: res.typeDeSalle?.id,
                  type: res.typeDeSalle?.nom || form.type,
                  capacity: res.capacite,
                  description: res.description,
                }
              : room
          )
        );
        successToast("Salle modifiée avec succès !");
      }
      setOpen(false);
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      setFormError(
        mode === "create"
          ? "Erreur lors de la création."
          : "Erreur lors de la modification."
      );
      errorToast("Erreur lors de l'opération.");
    }
  };

  useEffect(() => {
    const onKey = (ev) => ev.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="rooms-page">
      <ToastContainer />
      <div className="rooms-container">
        <p className="rooms-subtitle">Créer, filtrer et gérer les salles.</p>

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
                <option value={1}>Salle de cours</option>
                <option value={2}>Laboratoire</option>
                <option value={3}>Amphithéâtre</option>
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
                <h3>{mode === "edit" ? "Modifier une salle" : "Ajouter une salle"}</h3>
                <button className="modal-close" onClick={closeModal} aria-label="Fermer">
                  ✕
                </button>
              </div>

              <form className="modal-form" onSubmit={handleSubmit}>
                <p className="required-note">
                  Les champs marqués d’une <span className="required-star">*</span> sont obligatoires.
                </p>

                <div className="modal-field">
                  <label><span className="required-star">*</span> Code</label>
                  <input
                    value={form.code}
                    onChange={(e) => onChange("code", e.target.value)}
                    placeholder="Ex: A101"
                  />
                </div>

                <div className="modal-field">
                  <label><span className="required-star">*</span> Nom salle</label>
                  <input
                    value={form.name}
                    onChange={(e) => onChange("name", e.target.value)}
                    placeholder="Ex: Salle Informatique 1"
                  />
                </div>

                <div className="modal-grid">
                  <div className="modal-field">
                    <label><span className="required-star">*</span> Type</label>
                    <select
                      value={form.typeDeSalleId}
                      onChange={(e) => onChange("typeDeSalleId", e.target.value)}
                    >
                      <option value={1}>Salle de cours</option>
                      <option value={2}>Laboratoire</option>
                      <option value={3}>Amphithéâtre</option>
                    </select>
                  </div>

                  <div className="modal-field">
                    <label><span className="required-star">*</span> Capacité</label>
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
                    placeholder="Décrivez brièvement la salle..."
                    rows="4"
                  />
                </div>

                {formError && <div className="modal-error">{formError}</div>}

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={closeModal}>
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

        <Modal
          show={showDeleteModal}
          onHide={closeDeleteModal}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Supprimer une salle</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            Voulez-vous supprimer la salle{" "}
            <strong>
              {roomToDelete?.code} - {roomToDelete?.name}
            </strong>{" "}
            ?
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={closeDeleteModal}>
              Annuler
            </Button>

            <Button variant="danger" onClick={confirmDeleteRoom}>
              Supprimer
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}