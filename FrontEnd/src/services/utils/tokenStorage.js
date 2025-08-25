const CLAVE = 'auth_tokens_v1';

export function guardarTokens({ access, refresh, user }) {
  const payload = { access, refresh, user };
  localStorage.setItem(CLAVE, JSON.stringify(payload));
}

export function obtenerTokens() {
  const raw = localStorage.getItem(CLAVE);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function obtenerAccessToken() {
  return obtenerTokens()?.access || null;
}

export function obtenerRefreshToken() {
  return obtenerTokens()?.refresh || null;
}

export function obtenerUsuario() {
  return obtenerTokens()?.user || null;
}

export function limpiarTokens() {
  localStorage.removeItem(CLAVE);
}