import React, { useMemo, useState, useEffect } from "react";
import "../styles/users.css";
import { FiSearch } from "react-icons/fi";
import UserTable from "@/components/UserTable.jsx";
import { Modal, Button } from "react-bootstrap";

import { getUsers, createUser, updateUser, deleteUser } from "@/api/userApi";
import { getRoles } from "@/api/roleApi";
import { successToast, errorToast } from "@/utils/toastServices.js";

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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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
    const init = async () => {
      try {
        await Promise.all([loadUsers(), loadRoles()]);
      } catch (err) {
        console.error("Erreur initialisation", err);
      }
    };

    void init();
  }, []);

  /* ---------------- FILTER ---------------- */

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    return users.filter((u) => {
      const fullname = `${u.prenom ?? ""} ${u.nom ?? ""}`.toLowerCase();

      const matchQuery =
        !q || fullname.includes(q) || u.email.toLowerCase().includes(q);

      const matchRole =
        roleFilter === "Tous" ? true : u.role?.nom === roleFilter;

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

  const handleDelete = (id) => {
    const selectedUser = users.find((u) => u.id === id) || null;
    setUserToDelete(selectedUser);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);

      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));

      successToast("Utilisateur supprimé avec succès !");
      closeDeleteModal();
    } catch (err) {
      console.error("Erreur suppression", err);
      errorToast("Erreur lors de la suppression");
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (
      !form.prenom.trim() ||
      !form.nom.trim() ||
      !form.email.trim() ||
      !form.roleId
    ) {
      setFormError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const emailTrim = form.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
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

        await createUser(newUser);
        await loadUsers();

        successToast("Utilisateur créé avec succès !");
      } else {
        const updatedUser = {
          prenom: form.prenom.trim(),
          nom: form.nom.trim(),
          roleId: Number(form.roleId),
        };

        await updateUser(form.id, updatedUser);
        await loadUsers();

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
                <p className="required-note">
                  Les champs marqués d’une{" "}
                  <span className="required-star">*</span> sont obligatoires.
                </p>

                <div className="modal-field">
                  <label>
                    <span className="required-star">*</span> Prénom
                  </label>
                  <input
                    value={form.prenom}
                    onChange={(e) => onChange("prenom", e.target.value)}
                    placeholder="Ex: Liliane"
                  />
                </div>

                <div className="modal-field">
                  <label>
                    <span className="required-star">*</span> Nom
                  </label>
                  <input
                    value={form.nom}
                    onChange={(e) => onChange("nom", e.target.value)}
                    placeholder="Ex: Kana"
                  />
                </div>

                <div className="modal-field">
                  <label>
                    <span className="required-star">*</span> Email
                  </label>
                  <input
                    value={form.email}
                    readOnly={mode === "edit"}
                    onChange={(e) => onChange("email", e.target.value)}
                    placeholder="Ex: liliane@gmail.com"
                  />
                </div>

                <div className="modal-field">
                  <label>
                    <span className="required-star">*</span> Rôle
                  </label>
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

        <Modal
          show={showDeleteModal}
          onHide={closeDeleteModal}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Supprimer un utilisateur</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            Voulez-vous supprimer{" "}
            <strong>
              {userToDelete?.prenom} {userToDelete?.nom}
            </strong>{" "}
            ?
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={closeDeleteModal}>
              Annuler
            </Button>

            <Button variant="danger" onClick={confirmDeleteUser}>
              Supprimer
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}