import { refreshAccessToken, saveTokens, tokenIsExpiring } from '../services/spotifyAuth.service.js';

export async function requireSpotifyAuth(req, res, next) {
  if (!req.session.spotify?.refreshToken) {
    return res.status(401).json({ error: 'spotify_auth_required', message: 'Connect Spotify first.' });
  }

  try {
    if (tokenIsExpiring(req.session)) {
      const refreshed = await refreshAccessToken(req.session.spotify.refreshToken);
      saveTokens(req.session, refreshed);
    }
    req.spotifyAccessToken = req.session.spotify.accessToken;
    next();
  } catch (error) {
    if (error.code === 'invalid_grant' || error.status === 400 || error.status === 401) {
      delete req.session.spotify;
      return res.status(401).json({ error: 'spotify_reauthorization_required', message: 'Reconnect Spotify.' });
    }
    next(error);
  }
}
