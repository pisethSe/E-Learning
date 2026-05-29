const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";
export const LIVE_DATA_REFRESH_MS = 15000;

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

function buildUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function normalizeExternalUrl(value) {
  const trimmedValue = String(value || "").trim();

  if (!trimmedValue) {
    return "";
  }

  if (/^([a-z][a-z\d+\-.]*:)?\/\//i.test(trimmedValue) || trimmedValue.startsWith("/")) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
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
    cache: "no-store",
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
    cache: "no-store",
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
  if (resource.id) {
    return buildUrl(`/api/resources/${resource.id}/view`);
  }

  if (resource.external_url) {
    return normalizeExternalUrl(resource.external_url);
  }

  return resolveFileUrl(resource.file_path);
}

export function resolveResourceDownloadUrl(resource = {}) {
  if (!resource.id) {
    return resolveResourceUrl(resource);
  }

  return buildUrl(`/api/resources/${resource.id}/download`);
}

function getResourceDownloadName(resource = {}) {
  const fallbackName = resource.file_type === "image" ? "image" : "resource";
  const rawName = resource.original_filename || resource.title || fallbackName;
  return String(rawName).replace(/[\\/:*?"<>|]+/g, "-").trim() || fallbackName;
}

function triggerBrowserDownload(url, filename) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noreferrer";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function downloadResourceFile(resource = {}) {
  const downloadUrl = resolveResourceDownloadUrl(resource);
  const filename = getResourceDownloadName(resource);

  if (!downloadUrl) {
    return;
  }

  triggerBrowserDownload(downloadUrl, filename);
}
