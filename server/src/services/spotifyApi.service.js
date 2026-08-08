const SPOTIFY_API = 'https://api.spotify.com/v1';
export const TIME_RANGES = ['short_term', 'medium_term', 'long_term'];

async function spotifyGet(path, accessToken) {
  let response;
  try {
    response = await fetch(`${SPOTIFY_API}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    throw new Error(`Could not reach Spotify: ${error.message}`, { cause: error });
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.error?.message ?? 'Spotify API request failed');
    error.status = response.status;
    error.retryAfter = response.headers.get('retry-after');
    throw error;
  }
  return response.json();
}

function normalizeTrack(track) {
  return {
    id: track.id,
    name: track.name,
    artists: track.artists.map((artist) => artist.name),
    albumName: track.album.name,
    albumImageUrl: track.album.images[0]?.url ?? null,
    spotifyUrl: track.external_urls.spotify,
  };
}

export async function fetchTopTracksAcrossRanges(accessToken, limit = 20) {
  const entries = await Promise.all(
    TIME_RANGES.map(async (timeRange) => {
      const query = new URLSearchParams({ time_range: timeRange, limit: String(limit) });
      const data = await spotifyGet(`/me/top/tracks?${query}`, accessToken);
      return [timeRange, data.items.map(normalizeTrack)];
    }),
  );
  return Object.fromEntries(entries);
}

export async function fetchRecentlyPlayed(accessToken, limit = 20) {
  const query = new URLSearchParams({ limit: String(limit) });
  const data = await spotifyGet(`/me/player/recently-played?${query}`, accessToken);

  return data.items.map((item) => ({
    ...normalizeTrack(item.track),
    playedAt: item.played_at,
  }));
}
