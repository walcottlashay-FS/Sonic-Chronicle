import { Router } from "express";

import { requireSpotifyAuth } from "../middleware/requireSpotifyAuth.js";

import {
  createSpotifyPlaylist,
  fetchRecentlyPlayed,
  fetchSpotifyProfile,
  fetchTopTracksAcrossRanges,
  searchSpotify,
} from "../services/spotifyApi.service.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { logTracksByRange } from "../utils/logTracks.js";

export const tracksRouter = Router();

// get the connected spotify profile
tracksRouter.get(
  "/profile",
  requireSpotifyAuth,
  asyncHandler(async (req, res) => {
    const profile = await fetchSpotifyProfile(
      req.spotifyAccessToken
    );

    res.json({
      data: profile,
    });
  })
);

// get top tracks
tracksRouter.get(
  "/top-tracks",
  requireSpotifyAuth,
  asyncHandler(async (req, res) => {
    let limit = Number(req.query.limit);

    if (!limit || limit < 1) {
      limit = 20;
    }

    if (limit > 50) {
      limit = 50;
    }

    const tracksByRange =
      await fetchTopTracksAcrossRanges(
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
  "/recently-played",
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
  "/search",
  requireSpotifyAuth,
  asyncHandler(async (req, res) => {
    const searchTerm = req.query.q;
    const searchType = req.query.type;

    if (!searchTerm || !searchTerm.trim()) {
      return res.status(400).json({
        message: "Please enter something to search.",
      });
    }

    if (
      searchType !== "artist" &&
      searchType !== "album" &&
      searchType !== "track"
    ) {
      return res.status(400).json({
        message:
          "Please choose artist, album, or track.",
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

// create a spotify playlist
tracksRouter.post(
  "/playlists",
  requireSpotifyAuth,
  asyncHandler(async (req, res) => {
    const name = req.body.name;
    const description =
      req.body.description || "";
    const isPublic = req.body.isPublic;
    const trackIds = req.body.trackIds;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message:
          "Please enter a playlist name.",
      });
    }

    if (
      !Array.isArray(trackIds) ||
      trackIds.length === 0
    ) {
      return res.status(400).json({
        message:
          "Please select at least one track.",
      });
    }

    if (trackIds.length > 100) {
      return res.status(400).json({
        message:
          "A playlist can contain up to 100 selected tracks.",
      });
    }

    const uniqueTrackIds = [];

    for (const trackId of trackIds) {
      if (
        typeof trackId === "string" &&
        !uniqueTrackIds.includes(trackId)
      ) {
        uniqueTrackIds.push(trackId);
      }
    }

    if (uniqueTrackIds.length === 0) {
      return res.status(400).json({
        message:
          "The selected tracks are not valid.",
      });
    }

    const playlist =
      await createSpotifyPlaylist(
        req.spotifyAccessToken,
        name.trim(),
        description.trim(),
        isPublic !== false,
        uniqueTrackIds
      );

    res.status(201).json({
      data: playlist,
    });
  })
);