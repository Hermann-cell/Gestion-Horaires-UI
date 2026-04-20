import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/login.css";
import bgImage from "@/assets/login-bg.jpg";
import logo from "@/assets/logo.jpg";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { loginUser } from "@/api/authApi";
import { useAuth } from "@/auth/useAuth.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(email, password);

      login({
        token: data.token,
        user: data.user,
      });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <section
        className="login-left"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="login-left-glass">
          <div className="login-left-content">
            <h1>Bienvenue</h1>
            <p>
              Gérez facilement les utilisateurs, les salles, les professeurs et
              les horaires depuis une interface centralisée.
            </p>

            <div className="login-left-badges">
              <span className="badge">Gestion des horaires</span>
              <span className="badge badge-outline">Collège La Cité</span>
            </div>
          </div>
        </div>
      </section>

      <section className="login-right">
        <div className="login-card modern">
          <div className="login-brand">
            <img src={logo} alt="logo" className="login-brand-logo" />
            <div className="login-brand-text">
              <span className="login-brand-title">Gestion des horaires</span>
              <span className="login-brand-subtitle">Collège La Cité</span>
            </div>
          </div>

          <div className="login-header">
            <h2>Page de connexion</h2>
            <p className="subtitle">
              Connectez-vous pour accéder à votre espace.
            </p>
          </div>

          <form className="login-form modern" onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <div className="input-wrap">
                <span className="icon">
                  <FiMail />
                </span>
                <input
                  type="email"
                  placeholder="Entrez votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label>Mot de passe</label>
              <div className="input-wrap">
                <span className="icon">
                  <FiLock />
                </span>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="pwd-toggle icon-btn"
                  onClick={() => setShowPwd(!showPwd)}
                >
                  {showPwd ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="row-between">
              <label className="remember">
                <input type="checkbox" />
                Se souvenir de moi
              </label>

              <button
                type="button"
                className="link-btn"
                onClick={() => navigate("/forgot-password")}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-submit modern">
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}