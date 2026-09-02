import pg from 'pg';

import { env } from './env.js';

// connect to the database
export const database = new pg.Pool({
  connectionString: env.databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

// test the connection
export async function testDatabaseConnection() {
  await database.query('SELECT NOW()');

  console.log('PostgreSQL connected.');
}

// create the database tables
export async function createDatabaseTables() {
  // create the spotify token table
  await database.query(`
    CREATE TABLE IF NOT EXISTS spotify_tokens (
      id SERIAL PRIMARY KEY,
      spotify_user_id TEXT UNIQUE NOT NULL,
      access_token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      expires_at BIGINT NOT NULL
    )
  `);

  console.log('Spotify tokens table is ready.');

  // create the timeline memory table
  await database.query(`
    CREATE TABLE IF NOT EXISTS timeline_memories (
      id SERIAL PRIMARY KEY,
      spotify_user_id TEXT NOT NULL,
      track_id TEXT NOT NULL,
      played_at TIMESTAMPTZ NOT NULL,
      mood TEXT,
      note TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (spotify_user_id, track_id, played_at)
    )
  `);

  console.log('Timeline memories table is ready.');
}

// save or update spotify tokens
export async function saveSpotifyTokens(
  spotifyUserId,
  accessToken,
  refreshToken,
  expiresAt
) {
  const savedToken = await database.query(
    `SELECT id
    FROM spotify_tokens
    WHERE spotify_user_id = $1`,
    [spotifyUserId]
  );

  if (savedToken.rows.length === 0) {
    await database.query(
      `INSERT INTO spotify_tokens
      (
        spotify_user_id,
        access_token,
        refresh_token,
        expires_at
      )
      VALUES ($1, $2, $3, $4)`,
      [
        spotifyUserId,
        accessToken,
        refreshToken,
        expiresAt,
      ]
    );

    return;
  }

  await database.query(
    `UPDATE spotify_tokens
    SET access_token = $1,
        refresh_token = $2,
        expires_at = $3
    WHERE spotify_user_id = $4`,
    [
      accessToken,
      refreshToken,
      expiresAt,
      spotifyUserId,
    ]
  );
}

// find saved spotify tokens
export async function getSpotifyTokens(
  spotifyUserId
) {
  const result = await database.query(
    `SELECT spotify_user_id,
            access_token,
            refresh_token,
            expires_at
    FROM spotify_tokens
    WHERE spotify_user_id = $1`,
    [spotifyUserId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

// create a timeline memory
export async function createTimelineMemory(
  spotifyUserId,
  trackId,
  playedAt,
  mood,
  note
) {
  const result = await database.query(
    `INSERT INTO timeline_memories
    (
      spotify_user_id,
      track_id,
      played_at,
      mood,
      note
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [
      spotifyUserId,
      trackId,
      playedAt,
      mood,
      note,
    ]
  );

  return result.rows[0];
}

// get the user's timeline memories
export async function getTimelineMemories(
  spotifyUserId
) {
  const result = await database.query(
    `SELECT *
    FROM timeline_memories
    WHERE spotify_user_id = $1
    ORDER BY played_at DESC`,
    [spotifyUserId]
  );

  return result.rows;
}

// update a timeline memory
export async function updateTimelineMemory(
  memoryId,
  spotifyUserId,
  mood,
  note
) {
  const result = await database.query(
    `UPDATE timeline_memories
    SET mood = $1,
        note = $2,
        updated_at = NOW()
    WHERE id = $3
      AND spotify_user_id = $4
    RETURNING *`,
    [
      mood,
      note,
      memoryId,
      spotifyUserId,
    ]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

// delete a timeline memory
export async function deleteTimelineMemory(
  memoryId,
  spotifyUserId
) {
  const result = await database.query(
    `DELETE FROM timeline_memories
    WHERE id = $1
      AND spotify_user_id = $2
    RETURNING id`,
    [
      memoryId,
      spotifyUserId,
    ]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}