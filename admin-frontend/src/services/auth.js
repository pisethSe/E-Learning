const STORAGE_KEY = "grade-a-admin-user";

export function getStoredAdminUser() {
  const rawUser = window.localStorage.getItem(STORAGE_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function setStoredAdminUser(user) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredAdminUser() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function getAdminDisplayName(user) {
  return user?.name || user?.email || "Admin";
}
