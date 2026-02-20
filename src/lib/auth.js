import { setBearerToken } from "./api";

const KEY = "jlabs_token";

export function getToken() {
  return localStorage.getItem(KEY);
}

export function setToken(token) {
  localStorage.setItem(KEY, token);
  setBearerToken(token);
}

export function clearToken() {
  localStorage.removeItem(KEY);
  setBearerToken(null);
}

// call once on app boot
export function bootstrapAuth() {
  const token = getToken();
  if (token) setBearerToken(token);
}
