import React, { useState } from "react";
import { useNavigate } from "react-router-dom"
import "../styles/Login.css";
import bgImage from "../assets/login-bg.jpg";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    // TEMPORAIRE : simulation (à supprimer quand l'API sera prête)
    localStorage.setItem("token", "fake-token");
    localStorage.setItem("role", "Administrateur");

    navigate("/app", { replace: true });

    // brancher l'API plus tard
    console.log("Login:", { email, password });
  }

  return (
    <div className="login-page">
      {/* LEFT */}
      <section
        className="login-left"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="login-left-glass">
          <div className="login-left-content">
            <h1>Bienvenue</h1>
            <p>Nous sommes heureux de vous revoir.</p>

            <div className="login-left-badges">
              <span className="badge">Gestion des horaires</span>
              <span className="badge badge-outline">Collège la cité</span>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT */}
      <section className="login-right">
        <div className="login-card modern">
          <div className="login-header">
            <h2>Page de connexion</h2>
            <p className="subtitle">Connectez-vous pour accéder à votre espace.</p>
          </div>

          <form className="login-form modern" onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div className="field">
              <label>Email</label>
              <div className="input-wrap">
                <span className="icon" aria-hidden="true">
                  <FiMail />
                </span>

                <input
                  type="email"
                  placeholder="Entrez votre Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="field">
              <label>Mot de passe</label>
              <div className="input-wrap">
                <span className="icon" aria-hidden="true">
                  <FiLock />
                </span>

                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="pwd-toggle icon-btn"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  title={showPwd ? "Masquer" : "Afficher"}
                >
                  {showPwd ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* OPTIONS */}
            <div className="row-between">
              <label className="remember">
                <input type="checkbox" />
                <span>Se souvenir de moi</span>
              </label>

              <button type="button" className="link-btn">
                Mot de passe oublié ?
              </button>
            </div>

            {error && <div className="login-error">{error}</div>}

            {/* SUBMIT */}
            <button className="login-submit modern" type="submit">
              Se connecter <span className="arrow">→</span>
            </button>

            <div className="login-footer">
              <span className="hint">Problème de connexion ?</span>
              <button type="button" className="link-btn">
                Contacter l’administrateur
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}