import crypto from 'node:crypto';

import { env } from '../config/env.js';

const TOKEN_URL =
  'https://accounts.spotify.com/api/token';

const AUTH_URL =
  'https://accounts.spotify.com/authorize';

export const SPOTIFY_SCOPES = [
  'user-top-read',
  'user-read-recently-played',
  'playlist-modify-public',
  'playlist-modify-private',
];

// create the spotify authorization header
function basicAuthorization() {
  const spotifyLogin =
    `${env.spotifyClientId}:${env.spotifyClientSecret}`;

  const encodedLogin =
    Buffer.from(spotifyLogin).toString('base64');

  return `Basic ${encodedLogin}`;
}

// request a token from spotify
async function requestToken(body) {
  let response;

  try {
    response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: basicAuthorization(),
        'Content-Type':
          'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(body),
    });
  } catch (error) {
    throw new Error(
      'Could not connect to the Spotify token service.'
    );
  }

  let result = {};

  try {
    result = await response.json();
  } catch (error) {
    result = {};
  }

  if (!response.ok) {
    let errorMessage =
      'Spotify token request failed.';

    if (result.error_description) {
      errorMessage = result.error_description;
    } else if (result.error) {
      errorMessage = result.error;
    }

    const spotifyError = new Error(errorMessage);

    spotifyError.status = response.status;
    spotifyError.code = result.error;

    throw spotifyError;
  }

  return result;
}

// create the spotify login link
export function createAuthorizationRequest(session) {
  const state =
    crypto.randomBytes(24).toString('hex');

  session.oauthState = state;

  const url = new URL(AUTH_URL);

  const query = new URLSearchParams({
    client_id: env.spotifyClientId,
    response_type: 'code',
    redirect_uri: env.spotifyRedirectUri,
    scope: SPOTIFY_SCOPES.join(' '),
    state: state,
  });

  url.search = query.toString();

  return url.toString();
}

// exchange the login code for tokens
export async function exchangeCode(code) {
  return requestToken({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: env.spotifyRedirectUri,
  });
}

// request a new access token
export async function refreshAccessToken(
  refreshToken
) {
  return requestToken({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
}

// save spotify tokens in the session
export function saveTokens(
  session,
  tokenResponse
) {
  const currentSpotify = session.spotify;

  let refreshToken =
    tokenResponse.refresh_token;

  let spotifyUserId = null;
  let tokenScope = tokenResponse.scope;

  // keep saved information during a refresh
  if (currentSpotify) {
    spotifyUserId = currentSpotify.userId;

    if (!refreshToken) {
      refreshToken =
        currentSpotify.refreshToken;
    }

    if (!tokenScope) {
      tokenScope = currentSpotify.scope;
    }
  }

  session.spotify = {
    userId: spotifyUserId,
    accessToken: tokenResponse.access_token,
    refreshToken: refreshToken,
    expiresAt:
      Date.now() +
      tokenResponse.expires_in * 1000,
    scope: tokenScope,
  };
}

// check if the token needs to be refreshed
export function tokenIsExpiring(
  session,
  bufferMs = 5 * 60 * 1000
) {
  if (!session.spotify) {
    return true;
  }

  if (!session.spotify.accessToken) {
    return true;
  }

  const refreshTime =
    session.spotify.expiresAt - bufferMs;

  return Date.now() >= refreshTime;
}