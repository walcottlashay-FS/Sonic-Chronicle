import crypto from 'node:crypto';
import { env } from '../config/env.js';

const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const AUTH_URL = 'https://accounts.spotify.com/authorize';
export const SPOTIFY_SCOPES = [
  'user-top-read',
  'playlist-modify-public',
  'playlist-modify-private',
];

function basicAuthorization() {
  return `Basic ${Buffer.from(`${env.spotifyClientId}:${env.spotifyClientSecret}`).toString('base64')}`;
}

async function requestToken(body) {
  let response;
  try {
    response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: basicAuthorization(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(body),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    throw new Error(`Spotify token service is unavailable: ${error.message}`, { cause: error });
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error_description ?? payload.error ?? 'Spotify token request failed');
    error.status = response.status;
    error.code = payload.error;
    throw error;
  }
  return payload;
}

export function createAuthorizationRequest(session) {
  const state = crypto.randomBytes(24).toString('hex');
  session.oauthState = state;

  const url = new URL(AUTH_URL);
  url.search = new URLSearchParams({
    client_id: env.spotifyClientId,
    response_type: 'code',
    redirect_uri: env.spotifyRedirectUri,
    scope: SPOTIFY_SCOPES.join(' '),
    state,
  });
  return url.toString();
}

export async function exchangeCode(code) {
  return requestToken({
    grant_type: 'authorization_code',
    code,
    redirect_uri: env.spotifyRedirectUri,
  });
}

export async function refreshAccessToken(refreshToken) {
  return requestToken({ grant_type: 'refresh_token', refresh_token: refreshToken });
}

export function saveTokens(session, tokenResponse) {
  session.spotify = {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token ?? session.spotify?.refreshToken,
    expiresAt: Date.now() + tokenResponse.expires_in * 1000,
    scope: tokenResponse.scope,
  };
}

export function tokenIsExpiring(session, bufferMs = 5 * 60 * 1000) {
  return !session.spotify?.accessToken || Date.now() >= session.spotify.expiresAt - bufferMs;
}
