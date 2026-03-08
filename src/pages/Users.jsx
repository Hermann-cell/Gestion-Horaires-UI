import React, { useMemo, useState, useEffect } from "react";
import "../styles/users.css";
import { FiSearch } from "react-icons/fi";
import UserTable from "../components/UserTable.jsx";

const emptyForm = {
  id: null,
  name: "",
  email: "",
  role: "Administrateur",
  status: "Actif",
};

const INITIAL_USERS = [
  {
    id: 1,
    name: "Liliane",
    email: "liliane@email.com",
    role: "Administrateur",
    status: "Actif",
  },
  {
    id: 2,
    name: "Hermann",
    email: "hermann@email.com",
    role: "Responsable administratif",
    status: "Actif",
  },
  {
    id: 3,
    name: "Albert",
    email: "albert@email.com",
    role: "Administrateur",
    status: "Inactif",
  },
];

export default function Users() {
  const [users, setUsers] = useState(INITIAL_USERS);

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tous");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((u) => {
      const matchQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      const matchRole = roleFilter === "Tous" ? true : u.role === roleFilter;

      return matchQuery && matchRole;
    });
  }, [users, query, roleFilter]);

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
      name: user.name ?? "",
      email: user.email ?? "",
      role: user.role ?? "Administrateur",
      status: user.status ?? "Actif",
    });
    setOpen(true);
  };

  const handleDelete = (id) => {
    const ok = window.confirm("Voulez-vous supprimer cet utilisateur ?");
    if (!ok) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Veuillez remplir le nom et l’email.");
      return;
    }

    const emailTrim = form.email.trim();
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim);
    if (!okEmail) {
      setFormError("Email invalide.");
      return;
    }

    if (mode === "create") {
      const exists = users.some(
        (u) => u.email.toLowerCase() === emailTrim.toLowerCase()
      );
      if (exists) {
        setFormError("Cet email existe déjà.");
        return;
      }

      const newUser = {
        id: Date.now(),
        name: form.name.trim(),
        email: emailTrim,
        role: form.role,
        status: form.status,
      };

      setUsers((prev) => [newUser, ...prev]);
      setOpen(false);
      setForm(emptyForm);
      return;
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === form.id
          ? {
              ...u,
              name: form.name.trim(),
              email: emailTrim,
              role: form.role,
              status: form.status,
            }
          : u
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
    <div className="users-page">
      <div className="users-container">
        <p className="users-subtitle">
          Créer, filtrer et gérer les comptes.
        </p>

        <div className="users-filters-card">
          <div className="users-filters-grid">
            <div className="filter-group">
              <label>Recherche utilisateur</label>
              <div className="search-box">
                <FiSearch />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Recherche (nom ou email)..."
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Rôle</label>
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
            </div>
          </div>

          <div className="users-actions">
            <button className="add-user-btn" onClick={openCreateModal}>
              + Ajouter un utilisateur
            </button>
          </div>
        </div>

        <UserTable
          users={filteredUsers}
          onDelete={handleDelete}
          onEdit={openEditModal}
        />

        {open && (
          <div className="modal-overlay" onMouseDown={closeModal}>
            <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h3>
                  {mode === "edit"
                    ? "Modifier un utilisateur"
                    : "Ajouter un utilisateur"}
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
                <div className="modal-field">
                  <label>Nom</label>
                  <input
                    value={form.name}
                    onChange={(e) => onChange("name", e.target.value)}
                    placeholder="Ex: Alice Ngningha"
                  />
                </div>

                <div className="modal-field">
                  <label>Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => onChange("email", e.target.value)}
                    placeholder="Ex: alice@email.com"
                  />
                </div>

                <div className="modal-grid">
                  <div className="modal-field">
                    <label>Rôle</label>
                    <select
                      value={form.role}
                      onChange={(e) => onChange("role", e.target.value)}
                    >
                      <option value="Administrateur">Administrateur</option>
                      <option value="Responsable administratif">
                        Responsable administratif
                      </option>
                    </select>
                  </div>

                  <div className="modal-field">
                    <label>Statut</label>
                    <select
                      value={form.status}
                      onChange={(e) => onChange("status", e.target.value)}
                    >
                      <option value="Actif">Actif</option>
                      <option value="Inactif">Inactif</option>
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
      </div>
    </div>
  );
}