const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

function buildUrl(path) {
  return `${API_BASE_URL}${path}`;
}

async function parseJsonResponse(response, label) {
  if (!response.ok) {
    throw new Error(`Failed to fetch ${label}: ${response.status}`);
  }

  return response.json();
}

export async function fetchResources(params = {}, options = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  const url = queryString
    ? buildUrl(`/api/resources/?${queryString}`)
    : buildUrl("/api/resources/");

  const response = await fetch(url, {
    signal: options.signal,
  });

  return parseJsonResponse(response, "resources");
}

export async function fetchEvents(params = {}, options = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  const url = queryString
    ? buildUrl(`/api/events/?${queryString}`)
    : buildUrl("/api/events/");

  const response = await fetch(url, {
    signal: options.signal,
  });

  return parseJsonResponse(response, "events");
}

export function resolveFileUrl(filePath) {
  if (!filePath) {
    return "";
  }

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  const normalizedPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function resolveResourceUrl(resource = {}) {
  if (resource.external_url) {
    return resource.external_url;
  }

  return resolveFileUrl(resource.file_path);
}
