import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "../styles/Login.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!token) {
      setError("Lien invalide ou token manquant.");
      return;
    }

    if (!trimmedPassword) {
      setError("Veuillez entrer un nouveau mot de passe.");
      return;
    }

    if (trimmedPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (!trimmedConfirmPassword) {
      setError("Veuillez confirmer le mot de passe.");
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    // Simulation en attendant le backend
    setMessage("Mot de passe réinitialisé avec succès.");
    console.log("Token:", token);
    console.log("Nouveau mot de passe:", trimmedPassword);

    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Réinitialiser le mot de passe</h2>
        <p>Entrez votre nouveau mot de passe.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="password">Nouveau mot de passe</label>
            <input
              id="password"
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
                if (message) setMessage("");
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError("");
                if (message) setMessage("");
              }}
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn-primary">
            Changer le mot de passe
          </button>
        </form>

        {message && <p className="info-message">{message}</p>}

        <div className="auth-links">
          <Link to="/login">Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;