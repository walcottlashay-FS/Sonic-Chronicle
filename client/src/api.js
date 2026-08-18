// backend server address
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';

// send requests to the backend
async function apiFetch(path, options = {}) {
  let response;

  // include the spotify login session
  options.credentials = 'include';

  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch (error) {
    throw new Error('Could not connect to the server.');
  }

  // check for request errors
  if (!response.ok) {
    let errorMessage = 'Something went wrong.';

    try {
      const result = await response.json();

      if (result.message) {
        errorMessage = result.message;
      }
    } catch (error) {
      errorMessage = 'Could not read the server response.';
    }

    throw new Error(errorMessage);
  }

  // return nothing if the request has no content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// spotify login link
export const loginUrl = `${API_URL}/api/auth/login`;

// check login status
export function getAuthStatus() {
  return apiFetch('/api/auth/status');
}

// get top tracks
export function getTopTracks() {
  return apiFetch('/api/top-tracks?limit=20');
}

// get recently played tracks
export function getRecentlyPlayed() {
  return apiFetch('/api/recently-played?limit=20');
}

// disconnect spotify
export function logout() {
  return apiFetch('/api/auth/logout', {
    method: 'POST',
  });
}

// search spotify
export function searchSpotify(searchTerm, searchType) {
  const query = new URLSearchParams({
    q: searchTerm,
    type: searchType,
  });

  return apiFetch(`/api/search?${query}`);
}