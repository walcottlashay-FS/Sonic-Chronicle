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

// create the token table
export async function createDatabaseTables() {
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
}

// save or update spotify tokens
export async function saveSpotifyTokens(
  spotifyUserId,
  accessToken,
  refreshToken,
  expiresAt
) {
  const savedToken = await database.query(
    'SELECT id FROM spotify_tokens WHERE spotify_user_id = $1',
    [spotifyUserId]
  );

  if (savedToken.rows.length === 0) {
    await database.query(
      `INSERT INTO spotify_tokens
      (spotify_user_id, access_token, refresh_token, expires_at)
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
export async function getSpotifyTokens(spotifyUserId) {
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