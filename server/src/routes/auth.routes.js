import { Router } from 'express';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createAuthorizationRequest, exchangeCode, saveTokens, tokenIsExpiring } from '../services/spotifyAuth.service.js';

export const authRouter = Router();

authRouter.get('/login', (req, res) => res.redirect(createAuthorizationRequest(req.session)));

authRouter.get('/callback', asyncHandler(async (req, res) => {
  const { code, error, state } = req.query;
  if (error) return res.redirect(`${env.clientUrl}/?authError=${encodeURIComponent(error)}`);
  if (!code || !state || state !== req.session.oauthState) {
    return res.status(400).json({ error: 'state_mismatch', message: 'OAuth state validation failed.' });
  }

  delete req.session.oauthState;
  saveTokens(req.session, await exchangeCode(code));
  res.redirect(`${env.clientUrl}/?connected=true`);
}));

authRouter.get('/status', (req, res) => {
  res.json({ authenticated: Boolean(req.session.spotify?.refreshToken), tokenExpiring: tokenIsExpiring(req.session) });
});

authRouter.post('/logout', (req, res, next) => {
  req.session.destroy((error) => error ? next(error) : res.status(204).end());
});
