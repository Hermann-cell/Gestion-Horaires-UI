import { api } from "@/utils/api";

export function getProgrammes() {
  return api.get("/programmes");
}

export function getProgrammeById(id) {
  return api.get(`/programmes/${id}`);
}

export function createProgramme(programme) {
  return api.post("/programmes", programme);
}

export function updateProgramme(id, programme) {
  return api.put(`/programmes/${id}`, programme);
}

export function deleteProgramme(id) {
  return api.delete(`/programmes/${id}`);
}
