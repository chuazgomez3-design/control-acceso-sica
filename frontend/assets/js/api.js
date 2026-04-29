const API_BASE_URL = "http://127.0.0.1:8000/api";

function getToken() {
  return localStorage.getItem("sica_token");
}

function getAuthHeaders(extra = {}) {
  const token = getToken();
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: getAuthHeaders(options.headers || {}),
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof data === "object" && data?.detail
      ? data.detail
      : "Error en la solicitud.";
    throw new Error(message);
  }
  return data;
}
