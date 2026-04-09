import { api } from "../utils/api";

export const getProfesseurs = () => api.get("/professeurs");

export const createProfesseur = (professeur) => api.post("/professeurs", professeur);

export const updateProfesseur = (id, payload) => api.put(`/professeurs/${id}`, payload);

export const deleteProfesseur = (id) => api.delete(`/professeurs/${id}`);

export const getProfesseurById = (id) => api.get(`/professeurs/${id}`);

// Nouveaux endpoints pour l'affectation
export const getAvailableSeances = () => api.get("/professeurs/seances-disponibles");
export const assignProfesseurToSeance = (profId, seanceId) => 
  api.post(`/professeurs/${profId}/assign`, { seanceId });


export const getAllProfesseursWithPlanning = () =>
  api.get("/professeurs/all/plannings");