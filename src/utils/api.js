const BASE_URL = "http://localhost:3000/api";

async function request(url, method = "GET", body = null) {

  const token = localStorage.getItem("token");

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    }
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${url}`, options);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erreur API");
  }

  return data;
}

export const api = {

  get: (url) => request(url, "GET"),

  post: (url, body) => request(url, "POST", body),

  put: (url, body) => request(url, "PUT", body),

  delete: (url) => request(url, "DELETE")

};