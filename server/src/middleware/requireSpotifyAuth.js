// get the spotify token tools
import {
  refreshAccessToken,
  saveTokens,
  tokenIsExpiring,
} from '../services/spotifyAuth.service.js';

// get the database token tools
import {
  getSpotifyTokens,
  saveSpotifyTokens,
} from '../config/database.js';

// check spotify before using a protected route
export async function requireSpotifyAuth(
  req,
  res,
  next
) {
  // get the current spotify session
  const spotifySession = req.session.spotify;

  // stop if the user is not connected
  if (
    !spotifySession ||
    !spotifySession.refreshToken ||
    !spotifySession.userId
  ) {
    return res.status(401).json({
      error: 'spotify_auth_required',
      message: 'Connect Spotify first.',
    });
  }

  try {
    // find the user's tokens in the database
    const savedTokens = await getSpotifyTokens(
      spotifySession.userId
    );

    // stop if no saved tokens were found
    if (!savedTokens) {
      delete req.session.spotify;

      return res.status(401).json({
        error: 'spotify_auth_required',
        message: 'Connect Spotify first.',
      });
    }

    // load the database tokens into the session
    req.session.spotify = {
      userId: savedTokens.spotify_user_id,
      accessToken: savedTokens.access_token,
      refreshToken: savedTokens.refresh_token,
      expiresAt: Number(savedTokens.expires_at),
    };

    // check if the access token is expiring
    if (tokenIsExpiring(req.session)) {
      // ask spotify for a new access token
      const refreshedTokens =
        await refreshAccessToken(
          req.session.spotify.refreshToken
        );

      // keep the spotify user id
      const spotifyUserId =
        req.session.spotify.userId;

      // save the new token in the session
      saveTokens(
        req.session,
        refreshedTokens
      );

      req.session.spotify.userId =
        spotifyUserId;

      // save the new token in the database
      await saveSpotifyTokens(
        spotifyUserId,
        req.session.spotify.accessToken,
        req.session.spotify.refreshToken,
        req.session.spotify.expiresAt
      );
    }

    // give the access token to the next route
    req.spotifyAccessToken =
      req.session.spotify.accessToken;

    // continue to the requested route
    next();
  } catch (error) {
    // check if spotify rejected the token
    const tokenIsInvalid =
      error.code === 'invalid_grant' ||
      error.status === 400 ||
      error.status === 401;

    // ask the user to reconnect spotify
    if (tokenIsInvalid) {
      delete req.session.spotify;

      return res.status(401).json({
        error:
          'spotify_reauthorization_required',
        message: 'Reconnect Spotify.',
      });
    }

    // send other errors to the error handler
    next(error);
  }
}