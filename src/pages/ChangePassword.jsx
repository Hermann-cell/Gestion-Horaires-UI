import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "@/styles/Login.css";
import * as api from "@/api/authApi.js";
import { successToast, errorToast } from "@/utils/toastServices.js";

function ChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const passwordRules = useMemo(() => ({
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
    matchesConfirm:
      password.length > 0 &&
      confirmPassword.length > 0 &&
      password === confirmPassword,
  }), [password, confirmPassword]);

  const isPasswordValid =
    passwordRules.minLength &&
    passwordRules.hasUppercase &&
    passwordRules.hasLowercase &&
    passwordRules.hasNumber &&
    passwordRules.hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!currentPassword || !password || !confirmPassword) {
      return setError("Veuillez remplir tous les champs.");
    }

    if (!isPasswordValid) {
      return setError("Le mot de passe ne respecte pas toutes les règles.");
    }

    if (password !== confirmPassword) {
      return setError("Les mots de passe ne correspondent pas.");
    }

    if (currentPassword === password) {
      return setError("Le nouveau mot de passe doit être différent de l’ancien.");
    }

    try {
      await api.changePassword(currentPassword, password);

      setMessage("Mot de passe modifié avec succès.");
      successToast("Mot de passe modifié avec succès.");

      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/profile");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Erreur lors du changement du mot de passe.");
      errorToast("Impossible de modifier le mot de passe.");
    }
  };

  const RuleItem = ({ valid, text }) => (
    <li className={`password-rule ${valid ? "valid" : ""}`}>
      <span className="rule-circle"></span>
      <span className="rule-text">{text}</span>
    </li>
  );

  return (
    <div className="auth-container">
      <div className="auth-card reset-card">
        <h2>Changer le mot de passe</h2>
        <p>Entrez votre mot de passe actuel, puis définissez un nouveau mot de passe.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Mot de passe actuel</label>
            <div className="password-input-wrapper">
              <input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Mot de passe actuel"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setError("");
                  setMessage("");
                }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Nouveau mot de passe</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                  setMessage("");
                }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                  setMessage("");
                }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="password-rules-box">
            <h4>Le mot de passe doit respecter :</h4>
            <ul className="password-rules-list">
              <RuleItem valid={passwordRules.minLength} text="Au moins 8 caractères" />
              <RuleItem valid={passwordRules.hasUppercase} text="Au moins une majuscule" />
              <RuleItem valid={passwordRules.hasLowercase} text="Au moins une minuscule" />
              <RuleItem valid={passwordRules.hasNumber} text="Au moins un chiffre" />
              <RuleItem valid={passwordRules.hasSpecial} text="Au moins un caractère spécial" />
              <RuleItem valid={passwordRules.matchesConfirm} text="La confirmation doit correspondre" />
            </ul>
          </div>

          {error && <div className="login-error">{error}</div>}
          {message && <p className="info-message">{message}</p>}

          <button
            type="submit"
            className="btn-primary"
            disabled={!isPasswordValid || password !== confirmPassword}
          >
            Changer le mot de passe
          </button>
        </form>

        <div className="auth-links">
          <Link to="/profile">Retour au profil</Link>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;