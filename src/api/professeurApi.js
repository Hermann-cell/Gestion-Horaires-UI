import { api } from "../utils/api";

export function getProfesseurs() {
  return api.get("/professeurs");
}

export function createProfesseur(professeur) {
  return api.post("/professeurs", professeur);
}

export function updateProfesseur(id, professeur) {
  return api.put(`/professeurs/${id}`, professeur);
}

export function deleteProfesseur(id) {
  return api.delete(`/professeurs/${id}`);
}