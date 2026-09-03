import { useEffect, useState } from "react";

import {
  createMemory,
  deleteMemory,
  getAuthStatus,
  getMemories,
  getRecentlyPlayed,
  getTopTracks,
  loginUrl,
  logout,
  searchSpotify,
  updateMemory,
} from "./api.js";

import "./styles.css";

// format date and time
function formatPlayedAt(playedAt) {
  const date = new Date(playedAt);

  return date.toLocaleString();
}

// make range names easier to read
function formatRangeName(range) {
  if (range === "short_term") {
    return "Last 4 Weeks";
  }

  if (range === "medium_term") {
    return "Last 6 Months";
  }

  return "Past Year";
}

// make mood names easier to read
function formatMoodName(mood) {
  if (!mood) {
    return "";
  }

  return mood.charAt(0).toUpperCase() + mood.slice(1);
}

export default function AuthenticatedApp({ initialPage = "chronicle" }) {
  // app information
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activePage, setActivePage] = useState(initialPage);

  // listening history
  const [topTracks, setTopTracks] = useState(null);
  const [selectedRange, setSelectedRange] = useState("short_term");
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [recentTracks, setRecentTracks] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [recentLoading, setRecentLoading] = useState(false);

  // timeline memory information
  const [memories, setMemories] = useState([]);
  const [memoryTrack, setMemoryTrack] = useState(null);
  const [memoryMood, setMemoryMood] = useState("");
  const [memoryNote, setMemoryNote] = useState("");
  const [memorySaving, setMemorySaving] = useState(false);

  // search information
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("artist");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // tracks selected for the playlist
  const [playlistTracks, setPlaylistTracks] = useState([]);

  // check spotify connection
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const result = await getAuthStatus();

        setAuthenticated(result.authenticated);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    checkAuthStatus();
  }, []);

  // load selected playlist tracks
  useEffect(() => {
    const savedTracks = localStorage.getItem("sonicPlaylistTracks");

    if (savedTracks) {
      try {
        setPlaylistTracks(JSON.parse(savedTracks));
      } catch (error) {
        localStorage.removeItem("sonicPlaylistTracks");
      }
    }
  }, []);

  // load top tracks
  async function loadTopTracks() {
    setTimelineLoading(true);
    setMessage("");
    setSelectedTrack(null);

    try {
      const result = await getTopTracks();

      setTopTracks(result.data);
      setSelectedRange("short_term");
      setMessage("Your listening timeline was loaded.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setTimelineLoading(false);
    }
  }

  // change listening range
  function changeListeningRange(range) {
    setSelectedRange(range);
    setSelectedTrack(null);
  }

  // select a track
  function showTrackDetails(track) {
    setSelectedTrack(track);
  }

  // check if a track is selected
  function trackIsSelected(trackId) {
    return playlistTracks.some((track) => track.id === trackId);
  }

  // add or remove a playlist track
  function togglePlaylistTrack(track) {
    let updatedTracks;

    if (trackIsSelected(track.id)) {
      updatedTracks = playlistTracks.filter((item) => item.id !== track.id);
    } else {
      updatedTracks = [...playlistTracks, track];
    }

    setPlaylistTracks(updatedTracks);

    localStorage.setItem(
      "sonicPlaylistTracks",
      JSON.stringify(updatedTracks),
    );
  }

  // find a memory for a specific play
  function findMemoryForTrack(track) {
    return memories.find((memory) => {
      const memoryDate = new Date(memory.played_at).getTime();

      const trackDate = new Date(track.playedAt).getTime();

      return memory.track_id === track.id && memoryDate === trackDate;
    });
  }

  // load recently played and saved memories
  async function loadRecentlyPlayed() {
    setRecentLoading(true);
    setMessage("");

    try {
      const trackResult = await getRecentlyPlayed();

      const memoryResult = await getMemories();

      setRecentTracks(trackResult.data);
      setMemories(memoryResult.data);

      if (trackResult.data.length > 0) {
        setMessage("Your recently played songs were loaded.");
      } else {
        setMessage("No recently played songs were found.");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setRecentLoading(false);
    }
  }

  // open the memory form
  function openMemoryForm(track) {
    const savedMemory = findMemoryForTrack(track);

    setMemoryTrack(track);

    if (savedMemory) {
      setMemoryMood(savedMemory.mood || "");
      setMemoryNote(savedMemory.note || "");
    } else {
      setMemoryMood("");
      setMemoryNote("");
    }

    setMessage("");
  }

  // close the memory form
  function closeMemoryForm() {
    setMemoryTrack(null);
    setMemoryMood("");
    setMemoryNote("");
  }

  // save a new or updated memory
  async function saveTrackMemory(event) {
    event.preventDefault();

    const cleanNote = memoryNote.trim();

    if (!memoryMood && !cleanNote) {
      setMessage("Choose a mood or write a note before saving.");

      return;
    }

    setMemorySaving(true);
    setMessage("");

    try {
      const savedMemory = findMemoryForTrack(memoryTrack);

      let result;

      if (savedMemory) {
        result = await updateMemory(savedMemory.id, memoryMood, cleanNote);

        setMemories((currentMemories) =>
          currentMemories.map((memory) => {
            if (memory.id === savedMemory.id) {
              return result.data;
            }

            return memory;
          }),
        );

        setMessage("Your memory was updated.");
      } else {
        result = await createMemory(
          memoryTrack.id,
          memoryTrack.playedAt,
          memoryMood,
          cleanNote,
        );

        setMemories((currentMemories) => [result.data, ...currentMemories]);

        setMessage("Your memory was saved.");
      }

      closeMemoryForm();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setMemorySaving(false);
    }
  }

  // delete a saved memory
  async function removeTrackMemory(memory) {
    const shouldDelete = window.confirm("Delete this memory?");

    if (!shouldDelete) {
      return;
    }

    setMemorySaving(true);
    setMessage("");

    try {
      await deleteMemory(memory.id);

      setMemories((currentMemories) =>
        currentMemories.filter((item) => item.id !== memory.id),
      );

      closeMemoryForm();
      setMessage("Your memory was deleted.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setMemorySaving(false);
    }
  }

  // search spotify
  async function handleSearch(event) {
    event.preventDefault();

    if (!searchTerm.trim()) {
      setMessage("Please enter something to search.");

      return;
    }

    setSearchLoading(true);
    setSearchResults([]);
    setMessage("");

    try {
      const result = await searchSpotify(searchTerm.trim(), searchType);

      setSearchResults(result.data);

      if (result.data.length === 0) {
        setMessage("No results found.");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSearchLoading(false);
    }
  }

  // disconnect spotify and return to login
  async function disconnect() {
    try {
      await logout();

      window.location.href = "/login";
    } catch (error) {
      setMessage(error.message);
    }
  }

  let selectedTracks = [];

  if (topTracks && topTracks[selectedRange]) {
    selectedTracks = topTracks[selectedRange];
  }

  return (
    <main>
      <p className="eyebrow">SPRINT 2 · SEARCH AND CHRONICLE</p>

      <h1>Sonic Chronicle</h1>

      <p className="intro">
        Turn your listening history into a visual timeline.
      </p>

      {loading && <p>Loading...</p>}

      {!loading && !authenticated && (
        <a className="button" href={loginUrl}>
          Connect Spotify
        </a>
      )}

      {!loading && authenticated && (
        <div>
          <nav className="navigation">
            <button
              className={activePage === "search" ? "active-page" : "secondary"}
              onClick={() => setActivePage("search")}
            >
              Search
            </button>

            <button
              className={
                activePage === "chronicle" ? "active-page" : "secondary"
              }
              onClick={() => setActivePage("chronicle")}
            >
              Chronicle
            </button>

            <button
              className={
                activePage === "playlist" ? "active-page" : "secondary"
              }
              onClick={() => setActivePage("playlist")}
            >
              Build Playlist
            </button>
          </nav>

          {activePage === "search" && (
            <section className="page-section">
              <h2>Search Spotify</h2>

              <p>Search for your favorite artists, albums, and songs.</p>

              <form className="search-form" onSubmit={handleSearch}>
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search Spotify"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />

                <select
                  className="search-select"
                  value={searchType}
                  onChange={(event) => setSearchType(event.target.value)}
                >
                  <option value="artist">Artists</option>

                  <option value="album">Albums</option>

                  <option value="track">Tracks</option>
                </select>

                <button type="submit" disabled={searchLoading}>
                  {searchLoading ? "Searching..." : "Search"}
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((item) => (
                    <div className="search-card" key={item.id}>
                      {item.image && <img src={item.image} alt={item.name} />}

                      <div className="search-details">
                        <h3>{item.name}</h3>

                        {item.artists.length > 0 && (
                          <p>{item.artists.join(", ")}</p>
                        )}

                        {item.albumName && <p>{item.albumName}</p>}

                        <a
                          href={item.spotifyUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open in Spotify
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activePage === "chronicle" && (
            <section className="page-section">
              <h2>Your Chronicle</h2>

              <p>Explore how your listening has changed over time.</p>

              <div className="actions">
                <button onClick={loadTopTracks} disabled={timelineLoading}>
                  {timelineLoading
                    ? "Loading Timeline..."
                    : "Load Listening Timeline"}
                </button>

                <button onClick={loadRecentlyPlayed} disabled={recentLoading}>
                  {recentLoading ? "Loading Tracks..." : "Load Recently Played"}
                </button>
              </div>

              {topTracks && (
                <div className="timeline-section">
                  <h3>{formatRangeName(selectedRange)}</h3>

                  <div className="range-buttons">
                    <button
                      className={
                        selectedRange === "short_term"
                          ? "active-range"
                          : "secondary"
                      }
                      onClick={() => changeListeningRange("short_term")}
                    >
                      Last 4 Weeks
                    </button>

                    <button
                      className={
                        selectedRange === "medium_term"
                          ? "active-range"
                          : "secondary"
                      }
                      onClick={() => changeListeningRange("medium_term")}
                    >
                      Last 6 Months
                    </button>

                    <button
                      className={
                        selectedRange === "long_term"
                          ? "active-range"
                          : "secondary"
                      }
                      onClick={() => changeListeningRange("long_term")}
                    >
                      Past Year
                    </button>
                  </div>

                  {selectedTracks.length === 0 && (
                    <p className="empty-state">
                      No top tracks were found for this listening period.
                    </p>
                  )}

                  {selectedTracks.length > 0 && (
                    <ol className="timeline-list">
                      {selectedTracks.map((track, index) => (
                        <li key={track.id}>
                          <button
                            className="timeline-card"
                            onClick={() => showTrackDetails(track)}
                          >
                            <span className="track-number">{index + 1}</span>

                            {track.albumImageUrl && (
                              <img
                                src={track.albumImageUrl}
                                alt={track.albumName}
                              />
                            )}

                            <span className="timeline-details">
                              <strong>{track.name}</strong>

                              <span>{track.artists.join(", ")}</span>

                              <span>{track.albumName}</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ol>
                  )}

                  {selectedTrack && (
                    <div className="selected-track">
                      <h3>Track Details</h3>

                      {selectedTrack.albumImageUrl && (
                        <img
                          src={selectedTrack.albumImageUrl}
                          alt={selectedTrack.albumName}
                        />
                      )}

                      <h4>{selectedTrack.name}</h4>

                      <p>Artist: {selectedTrack.artists.join(", ")}</p>

                      <p>Album: {selectedTrack.albumName}</p>

                      <a
                        href={selectedTrack.spotifyUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open in Spotify
                      </a>

                      <div className="playlist-selection">
                        <button
                          type="button"
                          onClick={() => togglePlaylistTrack(selectedTrack)}
                        >
                          {trackIsSelected(selectedTrack.id)
                            ? "Remove from Playlist"
                            : "Add to Playlist"}
                        </button>

                        <span>{playlistTracks.length} selected</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {recentTracks && (
                <section className="recent-section">
                  <h2>Recently Played</h2>

                  {recentTracks.length === 0 && (
                    <p className="empty-state">
                      No recently played songs were found.
                    </p>
                  )}

                  {recentTracks.length > 0 && (
                    <ol className="track-list">
                      {recentTracks.map((track, index) => {
                        const savedMemory = findMemoryForTrack(track);

                        const formIsOpen =
                          memoryTrack &&
                          memoryTrack.id === track.id &&
                          memoryTrack.playedAt === track.playedAt;

                        return (
                          <li
                            key={`${track.id}-${track.playedAt}`}
                            className="track-card"
                          >
                            <span className="track-number">{index + 1}</span>

                            {track.albumImageUrl && (
                              <img
                                src={track.albumImageUrl}
                                alt={track.albumName}
                              />
                            )}

                            <div className="track-details">
                              <a
                                href={track.spotifyUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {track.name}
                              </a>

                              <span>
                                {track.artists.join(", ")} · {track.albumName}
                              </span>

                              <time dateTime={track.playedAt}>
                                {formatPlayedAt(track.playedAt)}
                              </time>

                              {savedMemory && (
                                <div className="memory-preview">
                                  {savedMemory.mood && (
                                    <span className="memory-mood">
                                      {formatMoodName(savedMemory.mood)}
                                    </span>
                                  )}

                                  {savedMemory.note && (
                                    <p>{savedMemory.note}</p>
                                  )}
                                </div>
                              )}
                            </div>

                            <button
                              className="secondary memory-button"
                              type="button"
                              onClick={() => openMemoryForm(track)}
                            >
                              {savedMemory ? "Edit Memory" : "Add Memory"}
                            </button>

                            {formIsOpen && (
                              <form
                                className="memory-form"
                                onSubmit={saveTrackMemory}
                              >
                                <h3>
                                  {savedMemory ? "Edit Memory" : "Add Memory"}
                                </h3>

                                <label htmlFor={`mood-${track.id}`}>Mood</label>

                                <select
                                  id={`mood-${track.id}`}
                                  value={memoryMood}
                                  onChange={(event) =>
                                    setMemoryMood(event.target.value)
                                  }
                                >
                                  <option value="">Choose a mood</option>

                                  <option value="happy">Happy</option>

                                  <option value="calm">Calm</option>

                                  <option value="energized">Energized</option>

                                  <option value="focused">Focused</option>

                                  <option value="nostalgic">Nostalgic</option>

                                  <option value="sad">Sad</option>
                                </select>

                                <label htmlFor={`note-${track.id}`}>Note</label>

                                <textarea
                                  id={`note-${track.id}`}
                                  maxLength="500"
                                  placeholder="Write something about this moment."
                                  value={memoryNote}
                                  onChange={(event) =>
                                    setMemoryNote(event.target.value)
                                  }
                                />

                                <div className="memory-actions">
                                  <button type="submit" disabled={memorySaving}>
                                    {memorySaving ? "Saving..." : "Save Memory"}
                                  </button>

                                  <button
                                    className="secondary"
                                    type="button"
                                    onClick={closeMemoryForm}
                                    disabled={memorySaving}
                                  >
                                    Cancel
                                  </button>

                                  {savedMemory && (
                                    <button
                                      className="delete-memory"
                                      type="button"
                                      onClick={() =>
                                        removeTrackMemory(savedMemory)
                                      }
                                      disabled={memorySaving}
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </form>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </section>
              )}
            </section>
          )}

          {activePage === "playlist" && (
            <section className="page-section">
              <h2>Build a Playlist</h2>

              <p>Create a playlist from your favorite songs.</p>
            </section>
          )}

          <button className="secondary disconnect-button" onClick={disconnect}>
            Disconnect Spotify
          </button>
        </div>
      )}

      {message && (
        <p className="status" role="status">
          {message}
        </p>
      )}
    </main>
  );
}
