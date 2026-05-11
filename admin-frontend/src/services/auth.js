const STORAGE_KEY = "grade-a-admin-name";

export function getStoredAdminName() {
  return window.localStorage.getItem(STORAGE_KEY) || "";
}

export function setStoredAdminName(value) {
  window.localStorage.setItem(STORAGE_KEY, value.trim());
}

export function clearStoredAdminName() {
  window.localStorage.removeItem(STORAGE_KEY);
}
