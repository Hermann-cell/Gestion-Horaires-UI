import { api } from "../utils/api";

export function loginUser(email, mot_de_passe) {

  return api.post("/users/login", {
    email,
    mot_de_passe
  });

}

export function logoutUser() {

  // suppression des données
  localStorage.removeItem("token");
  localStorage.removeItem("user");

}