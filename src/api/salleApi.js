import { api } from "@/utils/api";

export function getSalles() {
  return api.get("/salles");
}

export function createSalle(salle) {
  return api.post("/salles", salle);
}

export function updateSalle(id, salle) {
  return api.put(`/salles/${id}`, salle);
}

export function deleteSalle(id) {
  return api.delete(`/salles/${id}`);
}