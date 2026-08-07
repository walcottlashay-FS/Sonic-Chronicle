import { Router } from 'express';
import { requireSpotifyAuth } from '../middleware/requireSpotifyAuth.js';
import { fetchTopTracksAcrossRanges } from '../services/spotifyApi.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logTracksByRange } from '../utils/logTracks.js';

export const tracksRouter = Router();

tracksRouter.get('/top-tracks', requireSpotifyAuth, asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
  const tracksByRange = await fetchTopTracksAcrossRanges(req.spotifyAccessToken, limit);
  logTracksByRange(tracksByRange);
  res.json({ data: tracksByRange, meta: { ranges: Object.keys(tracksByRange), limit } });
}));
