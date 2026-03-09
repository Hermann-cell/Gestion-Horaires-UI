import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import bgImage from "../assets/login-bg.jpg";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { loginUser } from "../api/authApi";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {

    navigate("/", { replace: true });

      const data = await loginUser(email, password);

      // Stockage du token
      localStorage.setItem("token", data.token);

      // Stockage du user
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Redirection vers l'application
      navigate("/dashboard", { replace: true });

    } catch (err) {

      setError(err.message || "Erreur de connexion");

    } finally {

      setLoading(false);

    }
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
            <p className="subtitle">
              Connectez-vous pour accéder à votre espace.
            </p>
          </div>

          <form className="login-form modern" onSubmit={handleSubmit}>

            {/* EMAIL */}
            <div className="field">

              <label>Email</label>

              <div className="input-wrap">

                <span className="icon">
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

                <span className="icon">
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
                  aria-label={
                    showPwd
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
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

             <button
                type="button"
                className="link-btn"
                onClick={() => navigate("/forgot-password")}
          >
                Mot de passe oublié ?
              </button>

            </div>

            {/* ERROR */}
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button
              className="login-submit modern"
              type="submit"
              disabled={loading}
            >

              {loading ? "Connexion..." : "Se connecter →"}

            </button>

            <div className="login-footer">

              <span className="hint">
                Problème de connexion ?
              </span>

              <button
                type="button"
                className="link-btn"
              >
                Contacter l’administrateur
              </button>

            </div>

          </form>

        </div>

      </section>

    </div>
  );
}