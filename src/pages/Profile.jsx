import { useEffect, useMemo, useState } from "react";
import {
  FiUser,
  FiMail,
  FiShield,
  FiEdit2,
  FiSave,
  FiX,
  FiLock,
  FiClock,
  FiCalendar,
  FiCheckCircle,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { updateUser, getUserById } from "@/api/userApi";
import "@/styles/Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    role: "",
    statut: "Inactif",
    creerLe: null,
    modifierLe: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const hydrateForm = (sourceUser) => {
    setUser(sourceUser);
    setFormData({
      nom: sourceUser.nom || "",
      prenom: sourceUser.prenom || "",
      email: sourceUser.email || "",
      role: sourceUser.role?.nom || sourceUser.role || "Utilisateur",
      statut: sourceUser.statut ? "Actif" : "Inactif",
      creerLe: sourceUser.creerLe || null,
      modifierLe: sourceUser.modifierLe || null,
    });
  };

  useEffect(() => {
    const loadUser = async () => {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return;

      try {
        const storedUser = JSON.parse(rawUser);

        if (!storedUser?.id) {
          setError("Utilisateur introuvable.");
          return;
        }

        const freshUser = await getUserById(storedUser.id);

        const mergedUser = {
          ...storedUser,
          ...freshUser,
        };

        localStorage.setItem("user", JSON.stringify(mergedUser));
        hydrateForm(mergedUser);
      } catch (err) {
        console.error(err);

        try {
          const fallbackUser = JSON.parse(localStorage.getItem("user"));
          if (fallbackUser) hydrateForm(fallbackUser);
          else setError("Impossible de charger les informations de l’utilisateur.");
        } catch {
          setError("Impossible de charger les informations de l’utilisateur.");
        }
      }
    };

    loadUser();
  }, []);

  const fullName = useMemo(() => {
    return `${formData.prenom} ${formData.nom}`.trim();
  }, [formData]);

  const initials = useMemo(() => {
    const p = formData.prenom?.[0] || "";
    const n = formData.nom?.[0] || "";
    return `${p}${n}`.toUpperCase();
  }, [formData]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage("");
    setError("");
  };

  const handleCancel = () => {
    if (!user) return;
    hydrateForm(user);
    setIsEditing(false);
    setMessage("");
    setError("");
  };

  const handleSave = async () => {
    if (!user?.id) {
      setError("Utilisateur introuvable.");
      return;
    }

    if (!formData.nom.trim() || !formData.prenom.trim() || !formData.email.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const payload = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
      };

      await updateUser(user.id, payload);

      const freshUser = await getUserById(user.id);

      const updatedUser = {
        ...user,
        ...freshUser,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      hydrateForm(updatedUser);

      setIsEditing(false);
      setMessage("Profil mis à jour avec succès.");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Erreur lors de la mise à jour du profil.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <h2>Profil utilisateur</h2>
          <p>Impossible de charger les informations de l’utilisateur.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <p>Consultez et mettez à jour les informations de votre compte.</p>
        </div>

        {!isEditing ? (
          <button className="profile-btn primary" onClick={handleEdit}>
            <FiEdit2 />
            Modifier le profil
          </button>
        ) : (
          <div className="profile-actions">
            <button className="profile-btn secondary" onClick={handleCancel}>
              <FiX />
              Annuler
            </button>

            <button
              className="profile-btn primary"
              onClick={handleSave}
              disabled={loading}
            >
              <FiSave />
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        )}
      </div>

      {message && <div className="profile-alert success">{message}</div>}
      {error && <div className="profile-alert error">{error}</div>}

      <div className="profile-grid">
        <section className="profile-card profile-identity">
          <div className="profile-avatar">{initials}</div>

          <div className="profile-identity-info">
            <p className="profile-brand">Gestion des Horaires</p>
            <h2>{fullName || "Utilisateur"}</h2>
            <span className="role-badge">{formData.role}</span>
            <p className="profile-email">{formData.email}</p>

            <div className="profile-meta">
              <div className="meta-item">
                <span className="status-dot"></span>
                <span>{formData.statut}</span>
              </div>

              <div className="meta-item">
                <FiCalendar />
                <span>Créé le {formatDate(formData.creerLe)}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="profile-card">
          <div className="card-title">
            <FiUser />
            <h3>Informations personnelles</h3>
          </div>

          <div className="profile-field-grid">
            <div className="profile-field">
              <label>Prénom</label>
              {isEditing ? (
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                />
              ) : (
                <div className="profile-value">{formData.prenom}</div>
              )}
            </div>

            <div className="profile-field">
              <label>Nom</label>
              {isEditing ? (
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                />
              ) : (
                <div className="profile-value">{formData.nom}</div>
              )}
            </div>

            <div className="profile-field full">
              <label>Adresse e-mail</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              ) : (
                <div className="profile-value">{formData.email}</div>
              )}
            </div>

            <div className="profile-field">
              <label>Rôle</label>
              <div className="profile-value">{formData.role}</div>
            </div>

            <div className="profile-field">
              <label>Statut du compte</label>
              <div className="profile-value">{formData.statut}</div>
            </div>
          </div>
        </section>

        <section className="profile-card">
          <div className="card-title">
            <FiLock />
            <h3>Sécurité</h3>
          </div>

          <div className="security-item">
            <div>
              <h4>Mot de passe</h4>
              <p>Modifiez ou réinitialisez votre mot de passe de façon sécurisée.</p>
            </div>

          <Link to="/change-password" className="security-btn">
            Changer le mot de passe
          </Link>
          </div>
        </section>

        <section className="profile-card">
          <div className="card-title">
            <FiShield />
            <h3>Résumé du compte</h3>
          </div>

          <div className="summary-list">
            <div className="summary-row">
              <FiMail />
              <span>{formData.email}</span>
            </div>

            <div className="summary-row">
              <FiUser />
              <span>{fullName || "—"}</span>
            </div>

            <div className="summary-row">
              <FiShield />
              <span>{formData.role}</span>
            </div>

            <div className="summary-row">
              <FiCheckCircle />
              <span>Statut : {formData.statut}</span>
            </div>

            <div className="summary-row">
              <FiCalendar />
              <span>Compte créé le : {formatDate(formData.creerLe)}</span>
            </div>

            <div className="summary-row">
              <FiClock />
              <span>
                Dernière modification : {formatDateTime(formData.modifierLe)}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}