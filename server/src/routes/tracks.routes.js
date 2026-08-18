import { Router } from 'express';

import { requireSpotifyAuth } from '../middleware/requireSpotifyAuth.js';

import {
  fetchRecentlyPlayed,
  fetchTopTracksAcrossRanges,
  searchSpotify,
} from '../services/spotifyApi.service.js';

import { asyncHandler } from '../utils/asyncHandler.js';

import { logTracksByRange } from '../utils/logTracks.js';

export const tracksRouter = Router();

// get top tracks
tracksRouter.get(
  '/top-tracks',
  requireSpotifyAuth,
  asyncHandler(async (req, res) => {
    let limit = Number(req.query.limit);

    if (!limit || limit < 1) {
      limit = 20;
    }

    if (limit > 50) {
      limit = 50;
    }

    const tracksByRange = await fetchTopTracksAcrossRanges(
      req.spotifyAccessToken,
      limit
    );

    logTracksByRange(tracksByRange);

    res.json({
      data: tracksByRange,
      meta: {
        ranges: Object.keys(tracksByRange),
        limit: limit,
      },
    });
  })
);

// get recently played tracks
tracksRouter.get(
  '/recently-played',
  requireSpotifyAuth,
  asyncHandler(async (req, res) => {
    let limit = Number(req.query.limit);

    if (!limit || limit < 1) {
      limit = 20;
    }

    if (limit > 50) {
      limit = 50;
    }

    const tracks = await fetchRecentlyPlayed(
      req.spotifyAccessToken,
      limit
    );

    res.json({
      data: tracks,
      meta: {
        count: tracks.length,
        limit: limit,
      },
    });
  })
);

// search spotify
tracksRouter.get(
  '/search',
  requireSpotifyAuth,
  asyncHandler(async (req, res) => {
    const searchTerm = req.query.q;
    const searchType = req.query.type;

    // check the search term
    if (!searchTerm || !searchTerm.trim()) {
      return res.status(400).json({
        message: 'Please enter something to search.',
      });
    }

    // check the search type
    if (
      searchType !== 'artist' &&
      searchType !== 'album' &&
      searchType !== 'track'
    ) {
      return res.status(400).json({
        message: 'Please choose artist, album, or track.',
      });
    }

    const results = await searchSpotify(
      req.spotifyAccessToken,
      searchTerm.trim(),
      searchType
    );

    res.json({
      data: results,
    });
  })
);