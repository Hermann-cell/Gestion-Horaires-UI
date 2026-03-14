import { api } from "../utils/api";

export function getRoles() {
  return api.get("/roles");
}

export function createRole(role) {
  return api.post("/roles", role);
}

export function updateRole(id, role) {
  return api.put(`/roles/${id}`, role);
}

export function deleteRole(id) {
  return api.delete(`/roles/${id}`);
}