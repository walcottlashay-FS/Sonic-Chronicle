const SPOTIFY_API = "https://api.spotify.com/v1";

// spotify listening ranges
export const TIME_RANGES = [
  "short_term",
  "medium_term",
  "long_term",
];

// get information from spotify
async function spotifyGet(path, accessToken) {
  let response;

  try {
    response = await fetch(`${SPOTIFY_API}${path}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    throw new Error("Could not connect to Spotify.");
  }

  if (!response.ok) {
    await throwSpotifyError(response);
  }

  return response.json();
}

// send information to spotify
async function spotifyPost(path, accessToken, body) {
  let response;

  try {
    response = await fetch(`${SPOTIFY_API}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new Error("Could not connect to Spotify.");
  }

  if (!response.ok) {
    await throwSpotifyError(response);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// create a readable spotify error
async function throwSpotifyError(response) {
  let errorMessage = "Spotify request failed.";

  try {
    const result = await response.json();

    if (result.error && result.error.message) {
      errorMessage = result.error.message;
    }
  } catch (error) {
    errorMessage = "Could not read the Spotify error.";
  }

  const spotifyError = new Error(errorMessage);

  spotifyError.status = response.status;
  spotifyError.retryAfter = response.headers.get("retry-after");

  throw spotifyError;
}

// organize track details
function normalizeTrack(track) {
  const artistNames = [];

  for (const artist of track.artists) {
    artistNames.push(artist.name);
  }

  let albumImage = null;

  if (track.album.images.length > 0) {
    albumImage = track.album.images[0].url;
  }

  return {
    id: track.id,
    name: track.name,
    artists: artistNames,
    albumName: track.album.name,
    albumImageUrl: albumImage,
    spotifyUrl: track.external_urls.spotify,
  };
}

// get top tracks for each listening range
export async function fetchTopTracksAcrossRanges(
  accessToken,
  limit = 20,
) {
  const tracksByRange = {};

  for (const timeRange of TIME_RANGES) {
    const query = new URLSearchParams({
      time_range: timeRange,
      limit: String(limit),
    });

    const result = await spotifyGet(
      `/me/top/tracks?${query}`,
      accessToken,
    );

    const tracks = [];

    for (const track of result.items) {
      tracks.push(normalizeTrack(track));
    }

    tracksByRange[timeRange] = tracks;
  }

  return tracksByRange;
}

// get recently played tracks
export async function fetchRecentlyPlayed(accessToken, limit = 20) {
  const query = new URLSearchParams({
    limit: String(limit),
  });

  const result = await spotifyGet(
    `/me/player/recently-played?${query}`,
    accessToken,
  );

  const recentTracks = [];

  for (const item of result.items) {
    const track = normalizeTrack(item.track);

    track.playedAt = item.played_at;
    recentTracks.push(track);
  }

  return recentTracks;
}

// search artists, albums, and tracks
export async function searchSpotify(accessToken, searchTerm, type) {
  const query = new URLSearchParams({
    q: searchTerm,
    type: type,
    limit: "10",
  });

  const results = await spotifyGet(`/search?${query}`, accessToken);

  let items = [];

  if (type === "artist") {
    items = results.artists.items;
  }

  if (type === "album") {
    items = results.albums.items;
  }

  if (type === "track") {
    items = results.tracks.items;
  }

  const searchResults = [];

  for (const item of items) {
    let image = null;
    const artists = [];
    let albumName = "";

    if (item.images && item.images.length > 0) {
      image = item.images[0].url;
    }

    if (item.album && item.album.images.length > 0) {
      image = item.album.images[0].url;
    }

    if (item.artists) {
      for (const artist of item.artists) {
        artists.push(artist.name);
      }
    }

    if (item.album) {
      albumName = item.album.name;
    }

    searchResults.push({
      id: item.id,
      name: item.name,
      type: item.type,
      image: image,
      artists: artists,
      albumName: albumName,
      spotifyUrl: item.external_urls.spotify,
    });
  }

  return searchResults;
}

// get the connected spotify user
export async function fetchSpotifyProfile(accessToken) {
  const profile = await spotifyGet("/me", accessToken);

  return {
    id: profile.id,
  };
}

// create a spotify playlist and add tracks
export async function createSpotifyPlaylist(
  accessToken,
  name,
  description,
  isPublic,
  trackIds,
) {
  const playlist = await spotifyPost("/me/playlists", accessToken, {
    name: name,
    description: description,
    public: isPublic,
  });

  const trackUris = [];

  for (const trackId of trackIds) {
    trackUris.push(`spotify:track:${trackId}`);
  }

  await spotifyPost(
    `/playlists/${playlist.id}/items`,
    accessToken,
    {
      uris: trackUris,
    },
  );

  return {
    id: playlist.id,
    name: playlist.name,
    spotifyUrl: playlist.external_urls.spotify,
  };
}
