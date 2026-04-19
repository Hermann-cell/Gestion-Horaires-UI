import { api } from "@/utils/api";

// ---------------- LOGIN ----------------
export function loginUser(email, mot_de_passe) {
  return api.post("/users/login", {
    email,
    mot_de_passe
  });
}

// ---------------- LOGOUT ----------------
export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// ---------------- FORGOT PASSWORD ----------------
// Envoie email avec lien contenant le token
export function forgotPassword(email) {
  return api.post("/users/forgot-password", {
    email
  });
}

// ---------------- RESET PASSWORD ----------------
// Utilisé après clic sur le lien (token + nouveau password)
export function resetPassword(token, password) {
  return api.post("/users/reset-password", {
    token,
    password
  });

}

// ---------------- CHANGE PASSWORD ----------------
export function changePassword(currentPassword, newPassword) {
  return api.post("/users/change-password", {
    currentPassword,
    newPassword
  });
}