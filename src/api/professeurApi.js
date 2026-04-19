import { api } from "@/utils/api";

// Endpoint pour récupérer tous les professeurs
export const getProfesseurs = () => api.get("/professeurs");

// Endpoint pour créer un professeur
export const createProfesseur = (professeur) => api.post("/professeurs", professeur);

// Endpoint pour mettre à jour un professeur
export const updateProfesseur = (id, payload) => api.put(`/professeurs/${id}`, payload);

// Endpoint pour supprimer un professeur
export const deleteProfesseur = (id) => api.delete(`/professeurs/${id}`);

// Endpoint pour récupérer un professeur par ID avec ses disponibilités et spécialités
export const getProfesseurById = (id) => api.get(`/professeurs/${id}`);

// Nouveaux endpoints pour l'affectation
export const getAvailableSeances = () => api.get("/professeurs/seances-disponibles");

// Endpoint pour affecter un professeur à une séance
export const assignProfesseurToSeance = (profId, seanceId) => 
  api.post(`/professeurs/${profId}/assign`, { seanceId });    

// Endpoint pour désaffecter un professeur d'une séance
export const unassignProfesseurFromSeance = (seanceId) =>
  api.delete(`/seances/${seanceId}/professeur`);

// Endpoint pour récupérer tous les professeurs avec leurs plannings
export const getAllProfesseursWithPlanning = () =>
  api.get("/professeurs/all/plannings");