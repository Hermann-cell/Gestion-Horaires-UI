import { api } from "../utils/api";

export const getProfesseurs = () => api.get("/professeurs");

export const createProfesseur = (professeur) => api.post("/professeurs", professeur);

export const updateProfesseur = (id, payload) => api.put(`/professeurs/${id}`, payload);

export const deleteProfesseur = (id) => api.delete(`/professeurs/${id}`);

export const getProfesseurById = (id) => api.get(`/professeurs/${id}`);