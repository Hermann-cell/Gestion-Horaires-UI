import React, { useMemo, useState, useEffect } from "react";
import "../styles/users.css";
import { FiSearch } from "react-icons/fi";
import UserTable from "../components/UserTable.jsx";

import { getUsers, createUser, updateUser, deleteUser } from "../api/userApi";
import { getRoles } from "../api/roleApi";
import { successToast, errorToast } from "../utils/toastServices.js";

const emptyForm = {
  id: null,
  prenom: "",
  nom: "",
  email: "",
  roleId: "",
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tous");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  /* ---------------- LOAD USERS & ROLES ---------------- */

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Erreur chargement users", err);
      errorToast("Erreur lors du chargement des utilisateurs");
    }
  };

  const loadRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      console.error("Erreur chargement roles", err);
      errorToast("Erreur lors du chargement des rôles");
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
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

      successToast("Utilisateur supprimé avec succès !");
    } catch (err) {
      console.error("Erreur suppression", err);
      errorToast("Erreur lors de la suppression");
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.prenom.trim() || !form.email.trim() || !form.roleId) {
      setFormError("Veuillez remplir le prénom, l’email et sélectionner un rôle.");
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
          mot_de_passe: "Default123!",
          roleId: Number(form.roleId),
        };

        const created = await createUser(newUser);

        setUsers((prev) => [created, ...prev]);

        successToast("Utilisateur créé avec succès !");
      } else {

        const updatedUser = {
          prenom: form.prenom.trim(),
          nom: form.nom.trim(),
          roleId: Number(form.roleId),
        };

        const updated = await updateUser(form.id, updatedUser);

        setUsers((prev) =>
          prev.map((u) =>
            u.id === updated.id ? updated : u
          )
        );

        successToast("Utilisateur modifié avec succès !");
      }

      setOpen(false);
      setForm(emptyForm);

    } catch (err) {
      console.error("Erreur sauvegarde", err);
      setFormError("Une erreur est survenue.");
      errorToast("Erreur lors de l'opération");
    }
  };

  /* ---------------- ESC KEY ---------------- */

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
            {roles.map((r) => (
              <option key={r.id} value={r.nom}>
                {r.nom}
              </option>
            ))}
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
                    readOnly={mode === "edit"}
                    onChange={(e) => onChange("email", e.target.value)}
                    placeholder="Ex: hermann@email.com"
                  />
                </div>

                <div className="modal-field">
                  <label>Rôle</label>
                  <select
                    value={form.roleId}
                    onChange={(e) => onChange("roleId", e.target.value)}
                  >
                    <option value="">Sélectionnez un rôle</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nom}
                      </option>
                    ))}
                  </select>
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