import { api } from "@/utils/api";

export function getUsers() {
  return api.get("/users");
}

export function createUser(user) {
  return api.post("/users/register", user);
}

export function updateUser(id, user) {
  return api.put(`/users/${id}`, user);
}

export function deleteUser(id) {
  return api.delete(`/users/${id}`);
}

export function getUserById(id) {
  return api.get(`/users/${id}`);
}