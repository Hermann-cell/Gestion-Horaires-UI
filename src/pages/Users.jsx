import React, { useMemo, useState, useEffect } from "react";
import "../styles/users.css";
import { FiSearch } from "react-icons/fi";
import UserTable from "../components/UserTable.jsx";
import * as userApi from "../api/userApi";

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

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  /* -----------------------------
     LOAD USERS
  ----------------------------- */

  const loadUsers = async () => {
    try {
      setLoading(true);

      const data = await userApi.getUsers();

      const mapped = data.map((u) => ({
        id: u.id,
        name: `${u.prenom} ${u.nom}`,
        email: u.email,
        role: u.role?.nom ?? "",
        status: "Actif",
      }));

      setUsers(mapped);
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

  /* -----------------------------
     FILTER USERS
  ----------------------------- */

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((u) => {
      const matchQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);

      const matchRole =
        roleFilter === "Tous" ? true : u.role === roleFilter;

      return matchQuery && matchRole;
    });
  }, [users, query, roleFilter]);

  /* -----------------------------
     FORM
  ----------------------------- */

  const closeModal = () => setOpen(false);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openCreateModal = () => {
    setMode("create");
    setForm(emptyForm);
    setFormError("");
    setOpen(true);
  };

  const openEditModal = (user) => {
    setMode("edit");

    setForm({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    setFormError("");
    setOpen(true);
  };

  /* -----------------------------
     DELETE
  ----------------------------- */

  const handleDelete = async (id) => {
    const ok = window.confirm("Voulez-vous supprimer cet utilisateur ?");
    if (!ok) return;

    try {
      await userApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  /* -----------------------------
     CREATE / UPDATE
  ----------------------------- */

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
          mot_de_passe: "Temp123!",
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
        const payload = {
          nom: form.name.split(" ").slice(-1)[0],
          prenom: form.name.split(" ").slice(0, -1).join(" ") || form.name,
          email: emailTrim,
          roleId: form.role === "Administrateur" ? 1 : 2,
        };

        const updated = await userApi.updateUser(form.id, payload);

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
      setFormError("Erreur lors de l'enregistrement");
    }
  };

  /* -----------------------------
     ESC CLOSE MODAL
  ----------------------------- */

  useEffect(() => {
    const onKey = (ev) => ev.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* -----------------------------
     RENDER
  ----------------------------- */

  return (
    <div className="users-page">
      <div className="users-container">

        {loading && (
          <div className="page-loader">
            <div className="loader"></div>
            <p>Chargement des utilisateurs...</p>
          </div>
        )}

        {!loading && (
          <>
            <p className="users-subtitle" style={{ marginBottom: 16 }}>
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
          </>
        )}

      </div>
    </div>
  );
}