import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "../styles/Login.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const passwordRules = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
      matchesConfirm:
        password.length > 0 &&
        confirmPassword.length > 0 &&
        password === confirmPassword,
    };
  }, [password, confirmPassword]);

  const isPasswordValid =
    passwordRules.minLength &&
    passwordRules.hasUppercase &&
    passwordRules.hasLowercase &&
    passwordRules.hasNumber &&
    passwordRules.hasSpecial;

  const passwordStrength = useMemo(() => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (!password) {
      return { score: 0, label: "", className: "" };
    }

    if (score <= 2) {
      return { score, label: "Faible", className: "weak" };
    }

    if (score <= 4) {
      return { score, label: "Moyen", className: "medium" };
    }

    return { score, label: "Fort", className: "strong" };
  }, [password]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Lien invalide ou token manquant.");
      return;
    }

    if (!password) {
      setError("Veuillez entrer un nouveau mot de passe.");
      return;
    }

    if (!isPasswordValid) {
      setError("Le mot de passe ne respecte pas toutes les règles.");
      return;
    }

    if (!confirmPassword) {
      setError("Veuillez confirmer le mot de passe.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setMessage("Mot de passe réinitialisé avec succès.");
    console.log("Token:", token);
    console.log("Nouveau mot de passe:", password);

    setPassword("");
    setConfirmPassword("");
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
        <h2>Réinitialiser le mot de passe</h2>
        <p>Entrez votre nouveau mot de passe.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="password">Nouveau mot de passe</label>

            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                  if (message) setMessage("");
                }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="password-strength">
              <div className="strength-bar">
                <div
                  className={`strength-fill ${passwordStrength.className}`}
                  style={{
                    width:
                      passwordStrength.score === 0
                        ? "0%"
                        : `${(passwordStrength.score / 5) * 100}%`,
                  }}
                />
              </div>

              {passwordStrength.label && (
                <p className={`strength-text ${passwordStrength.className}`}>
                  Force du mot de passe : {passwordStrength.label}
                </p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>

            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError("");
                  if (message) setMessage("");
                }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? "Masquer la confirmation"
                    : "Afficher la confirmation"
                }
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="password-rules-box">
            <h4>Le mot de passe doit respecter les règles suivantes :</h4>
            <ul className="password-rules-list">
              <RuleItem valid={passwordRules.minLength} text="Au moins 8 caractères" />
              <RuleItem valid={passwordRules.hasUppercase} text="Au moins une lettre majuscule" />
              <RuleItem valid={passwordRules.hasLowercase} text="Au moins une lettre minuscule" />
              <RuleItem valid={passwordRules.hasNumber} text="Au moins un chiffre" />
              <RuleItem valid={passwordRules.hasSpecial} text="Au moins un caractère spécial" />
              <RuleItem
                valid={confirmPassword.length > 0 ? passwordRules.matchesConfirm : false}
                text="La confirmation doit être identique au mot de passe"
              />
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
          <Link to="/login">Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;