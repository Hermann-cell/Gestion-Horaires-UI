import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/rooms.css";
import { FiSearch } from "react-icons/fi";
import RoomTable from "../components/RoomTable.jsx";

import {
  getSalles,
  createSalle,
  updateSalle,
  deleteSalle,
} from "../api/salleApi.js";

const emptyForm = {
  id: null,
  code: "",
  capacite: "",
  typeDeSalleNom: "Salle de cours",
};

export default function Rooms() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("Tous");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  async function loadRooms() {
    try {
      setLoading(true);
      const data = await getSalles();
      setRooms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchQuery =
        !q ||
        room.code.toLowerCase().includes(q) ||
        room.typeDeSalle?.nom.toLowerCase().includes(q);

      const matchType =
        typeFilter === "Tous"
          ? true
          : room.typeDeSalle?.nom === typeFilter;

      return matchQuery && matchType;
    });
  }, [rooms, query, typeFilter]);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openCreateModal = () => {
    setMode("create");
    setForm(emptyForm);
    setOpen(true);
  };

  const openEditModal = (room) => {
    setMode("edit");

    setForm({
      id: room.id,
      code: room.code,
      capacite: room.capacite,
      typeDeSalleNom: room.typeDeSalle?.nom || "",
    });

    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === "create") {
        await createSalle(form);
      } else {
        await updateSalle(form.id, form);
      }

      await loadRooms();
      closeModal();
      setForm(emptyForm);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Voulez-vous supprimer cette salle ?");
    if (!ok) return;

    await deleteSalle(id);
    await loadRooms();
  };

  const handleView = (room) => {
    navigate(`/rooms/${room.id}`, {
      state: { room },
    });
  };

  if (loading) {
    return <div className="page-loader">Chargement des salles...</div>;
  }

  return (
    <div className="rooms-page">
      <div className="rooms-container">
        <p className="rooms-subtitle">Créer, filtrer et gérer les salles.</p>

        <div className="rooms-filters-card">
          <div className="rooms-filters-grid">
            <div className="filter-group">
              <label>Recherche</label>
              <div className="search-box">
                <FiSearch />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Code ou type"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Type salle</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="Tous">Tous</option>
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
              <h3>{mode === "edit" ? "Modifier salle" : "Ajouter salle"}</h3>

              <form onSubmit={handleSubmit}>
                <input
                  placeholder="Code"
                  value={form.code}
                  onChange={(e) => onChange("code", e.target.value)}
                />

                <select
                  value={form.typeDeSalleNom}
                  onChange={(e) =>
                    onChange("typeDeSalleNom", e.target.value)
                  }
                >
                  <option>Salle de cours</option>
                  <option>Laboratoire</option>
                  <option>Amphithéâtre</option>
                </select>

                <input
                  type="number"
                  placeholder="Capacité"
                  value={form.capacite}
                  onChange={(e) =>
                    onChange("capacite", parseInt(e.target.value))
                  }
                />

                {formError && <div className="modal-error">{formError}</div>}

                <button type="submit">
                  {mode === "edit" ? "Modifier" : "Créer"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}