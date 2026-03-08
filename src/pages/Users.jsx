import React, { useMemo, useState, useEffect } from "react";
import "../styles/users.css";
import { FiSearch } from "react-icons/fi";
import UserTable from "../components/UserTable.jsx";
import * as userApi from "../api/userApi"; // ton service API

const emptyForm = {
  id: null,
  name: "",
  email: "",
  role: "Administrateur",
  status: "Actif",
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tous");

  // Modal
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  // ---- LOAD USERS ----
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getUsers(); // API call
      setUsers(
        data.map((u) => ({
          id: u.id,
          name: `${u.prenom} ${u.nom}`,
          email: u.email,
          role: u.role.nom,
          status: "Actif", // ou récupérer le status si dispo dans l'API
        }))
      );
    } catch (err) {
      console.error(err);
      alert("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ---- FILTERED USERS ----
  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchQuery =
        !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = roleFilter === "Tous" ? true : u.role === roleFilter;
      return matchQuery && matchRole;
    });
  }, [users, query, roleFilter]);

  // ---- MODAL HELPERS ----
  const closeModal = () => setOpen(false);
  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

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

  // ---- ACTIONS ----
  const handleDelete = async (id) => {
    const ok = window.confirm("Voulez-vous supprimer cet utilisateur ?");
    if (!ok) return;

    try {
      await userApi.deleteUser(id); // API call
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression de l'utilisateur");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Veuillez remplir le nom et l’email.");
      return;
    }

    const emailTrim = form.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      setFormError("Email invalide.");
      return;
    }

    try {
      if (mode === "create") {
        const payload = {
          nom: form.name.split(" ").slice(-1)[0],
          prenom: form.name.split(" ").slice(0, -1).join(" ") || form.name,
          email: emailTrim,
          mot_de_passe: "Temp123!", // temporaire ou générer un mot de passe
          roleId: form.role === "Administrateur" ? 1 : 2,
        };

        const newUser = await userApi.createUser(payload);
        setUsers((prev) => [
          {
            id: newUser.id,
            name: `${newUser.prenom} ${newUser.nom}`,
            email: newUser.email,
            role: newUser.role.nom,
            status: "Actif",
          },
          ...prev,
        ]);
      } else {
        const updatePayload = {
          nom: form.name.split(" ").slice(-1)[0],
          prenom: form.name.split(" ").slice(0, -1).join(" ") || form.name,
          email: emailTrim,
          roleId: form.role === "Administrateur" ? 1 : 2,
        };
        const updated = await userApi.updateUser(form.id, updatePayload);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === form.id
              ? {
                  ...u,
                  name: `${updated.prenom} ${updated.nom}`,
                  email: updated.email,
                  role: updated.role.nom,
                }
              : u
          )
        );
      }
      setOpen(false);
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      setFormError("Erreur lors de l'enregistrement de l'utilisateur");
    }
  };

  // Fermer modal avec ESC
  useEffect(() => {
    const onKey = (ev) => ev.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
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

        {loading ? (
          <p>Chargement des utilisateurs...</p>
        ) : (
          <UserTable users={filteredUsers} onDelete={handleDelete} onEdit={openEditModal} />
        )}

        {/* MODAL */}
        {open && (
          <div className="modal-overlay" onMouseDown={closeModal}>
            <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h3>{mode === "edit" ? "Modifier un utilisateur" : "Ajouter un utilisateur"}</h3>
                <button className="modal-close" onClick={closeModal} aria-label="Fermer">
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
                    <select value={form.role} onChange={(e) => onChange("role", e.target.value)}>
                      <option value="Administrateur">Administrateur</option>
                      <option value="Responsable administratif">Responsable administratif</option>
                    </select>
                  </div>

                  <div className="modal-field">
                    <label>Statut</label>
                    <select value={form.status} onChange={(e) => onChange("status", e.target.value)}>
                      <option value="Actif">Actif</option>
                      <option value="Inactif">Inactif</option>
                    </select>
                  </div>
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
  );
}