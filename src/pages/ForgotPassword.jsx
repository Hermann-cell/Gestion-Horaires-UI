import { useState } from "react";
import { Link } from "react-router-dom";
import "@/styles/login.css";
import * as api from "@/api/authApi.js";
import { successToast, errorToast } from "@/utils/toastServices.js";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Veuillez entrer un email.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError("Veuillez entrer un email valide.");
      return;
    }

    try {
      setLoading(true);

      await api.forgotPassword(trimmedEmail);

      setMessage("Si cette adresse existe, un lien de réinitialisation a été envoyé dans votre boîte email.");
      successToast("Lien de réinitialisation envoyé.");
      setEmail("");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Impossible d'envoyer le lien.");
      errorToast("Erreur lors de l'envoi du lien.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Mot de passe oublié</h2>
        <p>Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Adresse email</label>
            <input
              id="email"
              type="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
                if (message) setMessage("");
              }}
            />
          </div>

          {error && <div className="login-error">{error}</div>}
          {message && <p className="info-message">{message}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;