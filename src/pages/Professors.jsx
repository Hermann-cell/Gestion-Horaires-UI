import React, { useEffect, useMemo, useState } from "react";
import "../styles/users.css";
import { FiSearch, FiMoreHorizontal } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import {
  getProfesseurs,
  createProfesseur,
  updateProfesseur,
  deleteProfesseur,
} from "../api/professeurApi";

import { getSpecialites } from "../api/specialiteApi";

import { successToast, errorToast } from "../utils/toastServices.js";

const emptyForm = {
  id: null,
  prenom: "",
  nom: "",
  specialiteId: null,
};

function ProfessorRow({
  professeur,
  onEdit,
  onDelete,
  onView,
  openMenuId,
  setOpenMenuId,
}) {
  const fullName = `${professeur.prenom ?? ""} ${professeur.nom ?? ""}`.trim();
  const isOpen = openMenuId === professeur.id;

  return (
    <tr className="user-row">
      <td className="user-name">
        <div className="avatar">
          {fullName?.charAt(0)?.toUpperCase() || "P"}
        </div>
        {fullName}
      </td>

      <td>{professeur.matricule}</td>

      <td className="menu-cell" style={{ position: "relative" }}>
        <button
          className="menu-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenuId(isOpen ? null : professeur.id);
          }}
        >
          <FiMoreHorizontal />
        </button>

        {isOpen && (
          <div
            className="user-menu"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              top: "42px",
              right: 0,
              zIndex: 1000,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setOpenMenuId(null);
                onView(professeur);
              }}
            >
              Consulter le détail
            </button>

            <button
              type="button"
              onClick={() => {
                setOpenMenuId(null);
                onEdit(professeur);
              }}
            >
              Modifier
            </button>

            <button
              type="button"
              onClick={() => {
                setOpenMenuId(null);
                onDelete(professeur.id);
              }}
            >
              Supprimer
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default function Professors() {
  const navigate = useNavigate();

  const [professeurs, setProfesseurs] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [query, setQuery] = useState("");

  const [open, setOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [profsData, specsData] = await Promise.all([
          getProfesseurs(),
          getSpecialites(),
        ]);
        setProfesseurs(Array.isArray(profsData) ? profsData : []);
        setSpecialites(Array.isArray(specsData) ? specsData : specsData?.data || []);
      } catch (err) {
        console.error("Erreur chargement", err);
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Erreur lors du chargement";
        errorToast(errorMessage);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const loadProfesseurs = async () => {
    try {
      const data = await getProfesseurs();
      setProfesseurs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement professeurs", err);
      errorToast("Erreur lors du chargement des professeurs");
    }
  };

  const filteredProfesseurs = useMemo(() => {
    const q = query.trim().toLowerCase();

    return professeurs.filter((p) => {
      const fullName = `${p.prenom ?? ""} ${p.nom ?? ""}`.toLowerCase();
      const matricule = (p.matricule ?? "").toLowerCase();

      return !q || fullName.includes(q) || matricule.includes(q);
    });
  }, [professeurs, query]);

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

  const openEditModal = (professeur) => {
    setMode("edit");
    setFormError("");
    const specialiteId = professeur.specialite_professeurs?.[0]?.specialiteId || null;
    setForm({
      id: professeur.id,
      prenom: professeur.prenom ?? "",
      nom: professeur.nom ?? "",
      specialiteId: specialiteId,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Voulez-vous supprimer ce professeur ?");
    if (!ok) return;

    try {
      await deleteProfesseur(id);
      setProfesseurs((prev) => prev.filter((p) => p.id !== id));
      successToast("Professeur supprimé avec succès !");
      setOpenMenuId(null);
    } catch (err) {
      console.error("Erreur suppression professeur :", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors de la suppression";
      errorToast(errorMessage);
    }
  };

  const handleView = (professeur) => {
    navigate(`/professors/${professeur.id}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const nomTrim = form.nom.trim();

    if (!nomTrim || !form.specialiteId) {
      setFormError("Le nom et la spécialité sont obligatoires.");
      return;
    }

    const payload = {
      prenom: form.prenom.trim(),
      nom: nomTrim,
      specialiteIds: [Number(form.specialiteId)],
    };

    try {
      if (mode === "create") {
        await createProfesseur(payload);
        successToast("Professeur créé avec succès !");
      } else {
        await updateProfesseur(form.id, payload);
        successToast("Professeur modifié avec succès !");
      }

      setOpen(false);
      setForm(emptyForm);
      await loadProfesseurs();
    } catch (err) {
      console.error("Erreur sauvegarde professeur", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        (mode === "create"
          ? "Erreur lors de la création."
          : "Erreur lors de la modification.");
      setFormError(errorMessage);
    }
  };

  useEffect(() => {
    const onKey = (ev) => {
      if (ev.key === "Escape") {
        setOpen(false);
        setOpenMenuId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="users-page">
      <div className="users-container">
        <p className="users-subtitle" style={{ marginBottom: 16 }}>
          Créer, rechercher et gérer les professeurs.
        </p>

        <div className="users-toolbar">
          <div className="search-box">
            <FiSearch />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Recherche (nom ou matricule)..."
            />
          </div>

          <button className="add-user-btn" onClick={openCreateModal}>
            + Ajouter un professeur
          </button>
        </div>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Nom complet</th>
                <th>Matricule</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredProfesseurs.map((professeur) => (
                <ProfessorRow
                  key={professeur.id}
                  professeur={professeur}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onView={handleView}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                />
              ))}
            </tbody>
          </table>

          {filteredProfesseurs.length === 0 && (
            <div className="empty-state">Aucun professeur trouvé.</div>
          )}
        </div>

        {open && (
          <div className="modal-overlay" onMouseDown={closeModal}>
            <div
              className="modal-card"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="modal-head">
                <h3>
                  {mode === "edit"
                    ? "Modifier un professeur"
                    : "Ajouter un professeur"}
                </h3>

                <button
                  className="modal-close"
                  onClick={closeModal}
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>

              <form className="modal-form" onSubmit={handleSubmit}>
                <p className="required-note">
                  Les champs marqués d’une{" "}
                  <span className="required-star">*</span> sont obligatoires.
                </p>

                <div className="modal-field">
                  <label>Prénom</label>
                  <input
                    value={form.prenom}
                    onChange={(e) => onChange("prenom", e.target.value)}
                    placeholder="Ex: Albert"
                  />
                </div>

                <div className="modal-field">
                  <label>
                    <span className="required-star">*</span> Nom
                  </label>
                  <input
                    value={form.nom}
                    onChange={(e) => onChange("nom", e.target.value)}
                    placeholder="Ex: Boyomo"
                  />
                </div>

                <div className="modal-field">
                  <label>
                    <span className="required-star">*</span> Spécialité
                  </label>
                  <select
                    value={form.specialiteId || ""}
                    onChange={(e) => onChange("specialiteId", e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Sélectionner une spécialité...</option>
                    {specialites.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.nom}
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
      </div>
    </div>
  );
}