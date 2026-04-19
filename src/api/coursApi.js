import { api } from "@/utils/api";

export function getCours() {
  return api.get("/cours");
}

export function getCoursById(id) {
  return api.get(`/cours/${id}`);
}

export function createCours(cours) {
  return api.post("/cours", cours);
}

export function updateCours(id, cours) {
  return api.put(`/cours/${id}`, cours);
}

export function deleteCours(id) {
  return api.delete(`/cours/${id}`);
}