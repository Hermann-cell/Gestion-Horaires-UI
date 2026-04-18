// src/utils/api.js

const BASE_URL = "http://localhost:3000/api";

// Classe d'erreur personnalisée pour les erreurs API
class ApiError extends Error {
  constructor(message, data = {}, status = 500) {
    super(message);
    this.name = "ApiError";
    this.response = {
      data: {
        message: message,
        ...data,
      },
      status: status,
    };
  }
}

async function request(url, method = "GET", body = null) {
  const token = localStorage.getItem("token");

  const options = { method, headers: {} };

  // Ajout du token si présent
  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  // Ajout du body uniquement si nécessaire
  if (body !== null) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${url}`, options);

  // Essayer de parser le JSON, même si réponse vide
  let data = null;
  try {
    data = await response.json();
  } catch {
    // pas de JSON à parser
  }

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || "Erreur API";
    throw new ApiError(errorMessage, data, response.status);
  }

  return data;
}

export const api = {
  get: (url) => request(url, "GET"),
  post: (url, body) => request(url, "POST", body),
  put: (url, body) => request(url, "PUT", body),
  delete: (url) => request(url, "DELETE", {}), // envoi body vide {} pour Fastify
};