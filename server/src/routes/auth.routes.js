import { Router } from 'express';

import { env } from '../config/env.js';

import { asyncHandler } from '../utils/asyncHandler.js';

import {
  createAuthorizationRequest,
  exchangeCode,
  refreshAccessToken,
  saveTokens,
  tokenIsExpiring,
} from '../services/spotifyAuth.service.js';

import {
  getSpotifyTokens,
  saveSpotifyTokens,
} from '../config/database.js';

import {
  fetchSpotifyProfile,
} from '../services/spotifyApi.service.js';

export const authRouter = Router();

// send the user to spotify
authRouter.get('/login', (req, res) => {
  const authorizationUrl = createAuthorizationRequest(
    req.session
  );

  res.redirect(authorizationUrl);
});

// finish the spotify login
authRouter.get(
  '/callback',
  asyncHandler(async (req, res) => {
    const { code, error, state } = req.query;

    if (error) {
      return res.redirect(
        `${env.clientUrl}/?authError=${encodeURIComponent(error)}`
      );
    }

    if (
      !code ||
      !state ||
      state !== req.session.oauthState
    ) {
      return res.status(400).json({
        error: 'state_mismatch',
        message: 'Spotify login could not be confirmed.',
      });
    }

    delete req.session.oauthState;

    const tokenResponse = await exchangeCode(code);

    saveTokens(req.session, tokenResponse);

    // get the spotify user id
    const profile = await fetchSpotifyProfile(
      req.session.spotify.accessToken
    );

    req.session.spotify.userId = profile.id;

    // save the tokens in the database
    await saveSpotifyTokens(
      profile.id,
      req.session.spotify.accessToken,
      req.session.spotify.refreshToken,
      req.session.spotify.expiresAt
    );

    res.redirect(`${env.clientUrl}/?connected=true`);
  })
);

// check if the user is still connected
authRouter.get(
  '/status',
  asyncHandler(async (req, res) => {
    const spotifySession = req.session.spotify;

    if (!spotifySession || !spotifySession.userId) {
      return res.json({
        authenticated: false,
        needsLogin: true,
      });
    }

    const savedTokens = await getSpotifyTokens(
      spotifySession.userId
    );

    if (!savedTokens) {
      delete req.session.spotify;

      return res.json({
        authenticated: false,
        needsLogin: true,
      });
    }

    // use the tokens saved in the database
    req.session.spotify = {
      userId: savedTokens.spotify_user_id,
      accessToken: savedTokens.access_token,
      refreshToken: savedTokens.refresh_token,
      expiresAt: Number(savedTokens.expires_at),
    };

    // refresh the token when it is close to expiring
    if (tokenIsExpiring(req.session)) {
      try {
        const refreshedTokens = await refreshAccessToken(
          req.session.spotify.refreshToken
        );

        const spotifyUserId =
          req.session.spotify.userId;

        saveTokens(req.session, refreshedTokens);

        req.session.spotify.userId = spotifyUserId;

        await saveSpotifyTokens(
          spotifyUserId,
          req.session.spotify.accessToken,
          req.session.spotify.refreshToken,
          req.session.spotify.expiresAt
        );
      } catch (error) {
        delete req.session.spotify;

        return res.json({
          authenticated: false,
          needsLogin: true,
        });
      }
    }

    res.json({
      authenticated: true,
      needsLogin: false,
    });
  })
);

// disconnect spotify
authRouter.post('/logout', (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.status(204).end();
  });
});