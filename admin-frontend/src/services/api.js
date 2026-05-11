const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

function buildUrl(path) {
  return `${API_BASE_URL}${path}`;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const detail =
      typeof payload === "object" && payload !== null
        ? payload.detail || payload.message
        : payload;

    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  return payload;
}

async function request(path, options = {}) {
  try {
    const response = await fetch(buildUrl(path), options);
    return parseResponse(response);
  } catch (error) {
    if (error instanceof Error && error.name === "TypeError") {
      throw new Error(
        `Cannot reach backend at ${API_BASE_URL}. Start the API server or update VITE_API_BASE_URL.`,
      );
    }

    throw error;
  }
}

function appendValue(formData, key, value) {
  if (value === undefined || value === null || value === "") {
    return;
  }

  if (typeof value === "boolean") {
    formData.append(key, value ? "true" : "false");
    return;
  }

  formData.append(key, value);
}

export function resolveAssetUrl(filePath) {
  if (!filePath) {
    return "";
  }

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  const normalizedPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function fetchAdminStats() {
  return request("/api/admin/stats");
}

export function fetchAdminResources() {
  return request("/api/admin/resources");
}

export function fetchAdminEvents() {
  return request("/api/admin/events");
}

export async function saveAdminResource(payload) {
  const formData = new FormData();

  appendValue(formData, "title", payload.title);
  appendValue(formData, "description", payload.description);
  appendValue(formData, "grade_level", payload.grade_level);
  appendValue(formData, "subject", payload.subject);
  appendValue(formData, "category", payload.category);
  appendValue(formData, "file_type", payload.file_type);
  appendValue(formData, "external_url", payload.external_url);
  appendValue(formData, "is_published", payload.is_published);

  if (payload.file instanceof File) {
    formData.append("file", payload.file);
  }

  const path = payload.id
    ? `/api/admin/resources/${payload.id}`
    : "/api/admin/resources/upload";
  const method = payload.id ? "PUT" : "POST";

  return request(path, {
    method,
    body: formData,
  });
}

export function deleteAdminResource(resourceId) {
  return request(`/api/admin/resources/${resourceId}`, {
    method: "DELETE",
  });
}

export async function saveAdminEvent(payload) {
  const formData = new FormData();

  appendValue(formData, "title", payload.title);
  appendValue(formData, "description", payload.description);
  appendValue(formData, "status", payload.status);
  appendValue(formData, "location", payload.location);
  appendValue(formData, "event_date", payload.event_date);
  appendValue(formData, "cta_label", payload.cta_label);
  appendValue(formData, "cta_url", payload.cta_url);
  appendValue(formData, "is_published", payload.is_published);

  if (payload.image instanceof File) {
    formData.append("image", payload.image);
  }

  const path = payload.id
    ? `/api/admin/events/${payload.id}`
    : "/api/admin/events";
  const method = payload.id ? "PUT" : "POST";

  return request(path, {
    method,
    body: formData,
  });
}

export function deleteAdminEvent(eventId) {
  return request(`/api/admin/events/${eventId}`, {
    method: "DELETE",
  });
}
