import React, { useMemo, useState, useEffect } from "react";
import "../styles/users.css";
import { FiSearch } from "react-icons/fi";
import UserTable from "../components/UserTable.jsx";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../api/userApi";

const emptyForm = {
  id: null,
  prenom: "",
  nom: "",
  email: "",
  roleId: "",
};

export default function Users() {
  const [users, setUsers] = useState([]);

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tous");

  // Modal
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  /* ---------------- LOAD USERS ---------------- */

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Erreur chargement users", err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* ---------------- FILTER ---------------- */

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((u) => {
      const fullname = `${u.prenom ?? ""} ${u.nom ?? ""}`.toLowerCase();

      const matchQuery =
        !q ||
        fullname.includes(q) ||
        u.email.toLowerCase().includes(q);

      const matchRole =
        roleFilter === "Tous"
          ? true
          : u.role?.nom === roleFilter;

      return matchQuery && matchRole;
    });
  }, [users, query, roleFilter]);

  /* ---------------- MODAL HELPERS ---------------- */

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

  const openEditModal = (user) => {
    setFormError("");
    setMode("edit");

    setForm({
      id: user.id,
      prenom: user.prenom ?? "",
      nom: user.nom ?? "",
      email: user.email ?? "",
      roleId: user.roleId ?? "",
    });

    setOpen(true);
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (id) => {
    const ok = window.confirm("Voulez-vous supprimer cet utilisateur ?");
    if (!ok) return;

    try {
      await deleteUser(id);

      setUsers((prev) =>
        prev.filter((u) => u.id !== id)
      );
    } catch (err) {
      console.error("Erreur suppression", err);
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.prenom.trim() || !form.email.trim()) {
      setFormError("Veuillez remplir le prénom et l’email.");
      return;
    }

    const emailTrim = form.email.trim();

    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim);

    if (!okEmail) {
      setFormError("Email invalide.");
      return;
    }

    try {
      if (mode === "create") {

        const newUser = {
          prenom: form.prenom.trim(),
          nom: form.nom.trim(),
          email: emailTrim,
          roleId: Number(form.roleId),
        };

        const created = await createUser(newUser);

        setUsers((prev) => [created, ...prev]);

      } else {

        const updatedUser = {
          id: form.id,
          prenom: form.prenom.trim(),
          nom: form.nom.trim(),
          email: emailTrim,
          roleId: Number(form.roleId),
        };

        const updated = await updateUser(updatedUser);

        setUsers((prev) =>
          prev.map((u) =>
            u.id === updated.id ? updated : u
          )
        );
      }

      setOpen(false);
      setForm(emptyForm);

    } catch (err) {
      console.error("Erreur sauvegarde", err);
      setFormError("Une erreur est survenue.");
    }
  };

  /* ---------------- ESC KEY ---------------- */

  useEffect(() => {
    const onKey = (ev) => ev.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
    <div className="users-page">
      <div className="users-container">

        <p className="users-subtitle" style={{ marginBottom: 16 }}>
          Créer, filtrer et gérer les comptes.
        </p>

        <div className="users-toolbar">

          <div className="search-box">
            <FiSearch />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Recherche (nom ou email)..."
            />
          </div>

          <select
            className="role-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="Tous">Tous</option>
            <option value="Administrateur">Administrateur</option>
            <option value="Responsable administratif">
              Responsable administratif
            </option>
          </select>

          <button className="add-user-btn" onClick={openCreateModal}>
            + Ajouter un utilisateur
          </button>

        </div>

        <UserTable
          users={filteredUsers.map((u) => ({
            ...u,
            name: `${u.prenom ?? ""} ${u.nom ?? ""}`,
            role: u.role?.nom,
          }))}
          onDelete={handleDelete}
          onEdit={openEditModal}
        />

        {/* MODAL */}
        {open && (
          <div className="modal-overlay" onMouseDown={closeModal}>
            <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>

              <div className="modal-head">
                <h3>
                  {mode === "edit"
                    ? "Modifier un utilisateur"
                    : "Ajouter un utilisateur"}
                </h3>

                <button className="modal-close" onClick={closeModal}>
                  ✕
                </button>
              </div>

              <form className="modal-form" onSubmit={handleSubmit}>

                <div className="modal-field">
                  <label>Prénom</label>
                  <input
                    value={form.prenom}
                    onChange={(e) => onChange("prenom", e.target.value)}
                    placeholder="Ex: Hermann"
                  />
                </div>

                <div className="modal-field">
                  <label>Nom</label>
                  <input
                    value={form.nom}
                    onChange={(e) => onChange("nom", e.target.value)}
                    placeholder="Ex: Njeutsa"
                  />
                </div>

                <div className="modal-field">
                  <label>Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => onChange("email", e.target.value)}
                    placeholder="Ex: hermann@email.com"
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

      </div>
    </div>
    </>
  );
}