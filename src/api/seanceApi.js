import { api } from "@/utils/api";

// CRUD Seances
export const getSeances = () => api.get("/seances");

export const createSeance = (seance) => api.post("/seances", seance);

export const updateSeance = (id, payload) => api.put(`/seances/${id}`, payload);

export const deleteSeance = (id) => api.delete(`/seances/${id}`);

export const getSeanceById = (id) => api.get(`/seances/${id}`);

// Affectation
export const assignProfesseurToSeance = (seanceId, professeurId) =>
  api.put(`/seances/${seanceId}/affecter-professeur`, { professeurId });

export const unassignProfesseurFromSeance = (seanceId) =>
  api.delete(`/seances/${seanceId}/professeur`);
