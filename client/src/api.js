const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3000';

async function apiFetch(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { credentials: 'include', ...options });
  } catch (error) {
    throw new Error('The Sonic Chronicle server is unavailable. Is it running?', { cause: error });
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message ?? `Request failed with status ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

export const loginUrl = `${API_URL}/api/auth/login`;
export const getAuthStatus = () => apiFetch('/api/auth/status');
export const getTopTracks = () => apiFetch('/api/top-tracks?limit=20');
export const getRecentlyPlayed = () => apiFetch('/api/recently-played?limit=20');
export const logout = () => apiFetch('/api/auth/logout', { method: 'POST' });
