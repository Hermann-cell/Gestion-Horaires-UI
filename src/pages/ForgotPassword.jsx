import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Login.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [testLink, setTestLink] = useState("");

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setTestLink("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Veuillez entrer un email.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError("Veuillez entrer un email valide.");
      return;
    }

    const fakeToken = "test123";
    const link = `http://localhost:5173/reset-password?token=${fakeToken}`;

    setMessage("Si cet email existe, un lien de réinitialisation a été envoyé.");
    setTestLink(link);
    setEmail("");
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
                if (testLink) setTestLink("");
              }}
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn-primary">
            Envoyer le lien
          </button>
        </form>

        {message && <p className="info-message">{message}</p>}

        {testLink && (
          <p className="info-message">
            Lien de test : <a href={testLink}>{testLink}</a>
          </p>
        )}

        <div className="auth-links">
          <Link to="/login">Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;