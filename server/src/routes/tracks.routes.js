import { Router } from 'express';
import { requireSpotifyAuth } from '../middleware/requireSpotifyAuth.js';
import { fetchRecentlyPlayed, fetchTopTracksAcrossRanges } from '../services/spotifyApi.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logTracksByRange } from '../utils/logTracks.js';

export const tracksRouter = Router();

tracksRouter.get('/top-tracks', requireSpotifyAuth, asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
  const tracksByRange = await fetchTopTracksAcrossRanges(req.spotifyAccessToken, limit);
  logTracksByRange(tracksByRange);
  res.json({ data: tracksByRange, meta: { ranges: Object.keys(tracksByRange), limit } });
}));

tracksRouter.get('/recently-played', requireSpotifyAuth, asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
  const tracks = await fetchRecentlyPlayed(req.spotifyAccessToken, limit);
  res.json({ data: tracks, meta: { count: tracks.length, limit } });
}));
