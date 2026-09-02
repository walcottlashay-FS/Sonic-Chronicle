import { Router } from 'express';

import {
  createTimelineMemory,
  deleteTimelineMemory,
  getTimelineMemories,
  updateTimelineMemory,
} from '../config/database.js';

import {
  requireSpotifyAuth,
} from '../middleware/requireSpotifyAuth.js';

import { asyncHandler } from '../utils/asyncHandler.js';

export const memoriesRouter = Router();

const allowedMoods = [
  'happy',
  'calm',
  'energized',
  'focused',
  'nostalgic',
  'sad',
];

// clean and check the memory information
function checkMemoryBody(body) {
  let mood = '';
  let note = '';

  if (typeof body.mood === 'string') {
    mood = body.mood.trim().toLowerCase();
  }

  if (typeof body.note === 'string') {
    note = body.note.trim();
  }

  if (!mood && !note) {
    return {
      error:
        'Choose a mood or write a note before saving.',
    };
  }

  if (mood && !allowedMoods.includes(mood)) {
    return {
      error: 'The selected mood is not supported.',
    };
  }

  if (note.length > 500) {
    return {
      error:
        'The note must be 500 characters or less.',
    };
  }

  return {
    mood: mood || null,
    note: note || null,
  };
}

// get all memories for the connected user
memoriesRouter.get(
  '/memories',
  requireSpotifyAuth,
  asyncHandler(async (req, res) => {
    const spotifyUserId =
      req.session.spotify.userId;

    const memories = await getTimelineMemories(
      spotifyUserId
    );

    res.json({
      data: memories,
    });
  })
);

// create a new timeline memory
memoriesRouter.post(
  '/memories',
  requireSpotifyAuth,
  asyncHandler(async (req, res) => {
    const { trackId, playedAt } = req.body;

    if (!trackId || !playedAt) {
      return res.status(400).json({
        error: 'missing_memory_information',
        message:
          'The track ID and played date are required.',
      });
    }

    const playedDate = new Date(playedAt);

    if (Number.isNaN(playedDate.getTime())) {
      return res.status(400).json({
        error: 'invalid_played_date',
        message:
          'The played date is not valid.',
      });
    }

    const checkedMemory = checkMemoryBody(
      req.body
    );

    if (checkedMemory.error) {
      return res.status(400).json({
        error: 'invalid_memory',
        message: checkedMemory.error,
      });
    }

    const spotifyUserId =
      req.session.spotify.userId;

    try {
      const memory = await createTimelineMemory(
        spotifyUserId,
        trackId,
        playedDate,
        checkedMemory.mood,
        checkedMemory.note
      );

      res.status(201).json({
        data: memory,
      });
    } catch (error) {
      // PostgreSQL uses this code for duplicates
      if (error.code === '23505') {
        return res.status(409).json({
          error: 'memory_already_exists',
          message:
            'A memory already exists for this play.',
        });
      }

      throw error;
    }
  })
);

// update a timeline memory
memoriesRouter.patch(
  '/memories/:memoryId',
  requireSpotifyAuth,
  asyncHandler(async (req, res) => {
    const memoryId = Number(
      req.params.memoryId
    );

    if (!Number.isInteger(memoryId)) {
      return res.status(400).json({
        error: 'invalid_memory_id',
        message: 'The memory ID is not valid.',
      });
    }

    const checkedMemory = checkMemoryBody(
      req.body
    );

    if (checkedMemory.error) {
      return res.status(400).json({
        error: 'invalid_memory',
        message: checkedMemory.error,
      });
    }

    const spotifyUserId =
      req.session.spotify.userId;

    const memory = await updateTimelineMemory(
      memoryId,
      spotifyUserId,
      checkedMemory.mood,
      checkedMemory.note
    );

    if (!memory) {
      return res.status(404).json({
        error: 'memory_not_found',
        message: 'The memory was not found.',
      });
    }

    res.json({
      data: memory,
    });
  })
);

// delete a timeline memory
memoriesRouter.delete(
  '/memories/:memoryId',
  requireSpotifyAuth,
  asyncHandler(async (req, res) => {
    const memoryId = Number(
      req.params.memoryId
    );

    if (!Number.isInteger(memoryId)) {
      return res.status(400).json({
        error: 'invalid_memory_id',
        message: 'The memory ID is not valid.',
      });
    }

    const spotifyUserId =
      req.session.spotify.userId;

    const deletedMemory =
      await deleteTimelineMemory(
        memoryId,
        spotifyUserId
      );

    if (!deletedMemory) {
      return res.status(404).json({
        error: 'memory_not_found',
        message: 'The memory was not found.',
      });
    }

    res.status(204).end();
  })
);