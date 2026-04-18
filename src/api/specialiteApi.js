import { api } from "../utils/api";

export const getSpecialites = () => api.get("/specialites");

export const createSpecialite = (specialite) => api.post("/specialites", specialite);

export const updateSpecialite = (id, payload) => api.put(`/specialites/${id}`, payload);

export const deleteSpecialite = (id) => api.delete(`/specialites/${id}`);

export const getSpecialiteById = (id) => api.get(`/specialites/${id}`);
