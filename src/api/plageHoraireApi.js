import { api } from "../utils/api";

export function getPlageHoraires() {
  return api.get("/plageHoraires");
}

export function getPlageHoraireById(id) {
  return api.get(`/plageHoraires/${id}`);
}

export function createPlageHoraire(plage) {
  return api.post("/plageHoraires", plage);
}

export function updatePlageHoraire(id, plage) {
  return api.put(`/plageHoraires/${id}`, plage);
}

export function deletePlageHoraire(id) {
  return api.delete(`/plageHoraires/${id}`);
}
