import { useEffect, useState } from "react";
import { Link } from "react-router";

import { createPlaylist } from "../api.js";

// build a spotify playlist from selected tracks
export default function PlaylistPage() {
  const [selectedTracks, setSelectedTracks] =
    useState([]);

  const [playlistName, setPlaylistName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [privacy, setPrivacy] =
    useState("public");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [spotifyUrl, setSpotifyUrl] =
    useState("");

  // load tracks selected from the chronicle
  useEffect(() => {
    const savedTracks =
      localStorage.getItem(
        "sonicPlaylistTracks"
      );

    if (!savedTracks) {
      return;
    }

    try {
      const tracks =
        JSON.parse(savedTracks);

      const uniqueTracks = [];

      for (const track of tracks) {
        const duplicate =
          uniqueTracks.some(
            (item) =>
              item.id === track.id
          );

        if (!duplicate) {
          uniqueTracks.push(track);
        }
      }

      setSelectedTracks(uniqueTracks);

      localStorage.setItem(
        "sonicPlaylistTracks",
        JSON.stringify(uniqueTracks)
      );
    } catch (error) {
      localStorage.removeItem(
        "sonicPlaylistTracks"
      );
    }
  }, []);

  // remove one selected track
  function removeTrack(trackId) {
    const updatedTracks =
      selectedTracks.filter(
        (track) =>
          track.id !== trackId
      );

    setSelectedTracks(updatedTracks);

    localStorage.setItem(
      "sonicPlaylistTracks",
      JSON.stringify(updatedTracks)
    );
  }

  // create the playlist through the backend
  async function handleCreatePlaylist(
    event
  ) {
    event.preventDefault();

    if (!playlistName.trim()) {
      setMessage(
        "Please enter a playlist name."
      );

      return;
    }

    if (selectedTracks.length === 0) {
      setMessage(
        "Select at least one track from your Chronicle."
      );

      return;
    }

    setLoading(true);
    setMessage("");
    setSpotifyUrl("");

    try {
      const trackIds =
        selectedTracks.map(
          (track) => track.id
        );

      const result =
        await createPlaylist(
          playlistName.trim(),
          description.trim(),
          privacy === "public",
          trackIds
        );

      setSpotifyUrl(
        result.data.spotifyUrl
      );

      setMessage(
        "Your Spotify playlist was created."
      );

      setSelectedTracks([]);

      localStorage.removeItem(
        "sonicPlaylistTracks"
      );

      // update the account playlist count
      const currentCount = Number(
        localStorage.getItem(
          "sonicPlaylistCount"
        ) || "0"
      );

      localStorage.setItem(
        "sonicPlaylistCount",
        String(currentCount + 1)
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <p className="eyebrow">
        BUILD YOUR SOUNDTRACK
      </p>

      <h1>Create Playlist</h1>

      <p className="intro">
        Turn the tracks from your Chronicle
        into a Spotify playlist.
      </p>

      <nav
        className="navigation"
        aria-label="Main navigation"
      >
        <Link
          className="button secondary"
          to="/chronicle"
        >
          Chronicle
        </Link>

        <Link
          className="button secondary"
          to="/search"
        >
          Search
        </Link>

        <Link
          className="button active-page"
          to="/playlist"
        >
          Build Playlist
        </Link>

        <Link
          className="button secondary"
          to="/account"
        >
          Account
        </Link>
      </nav>

      <section className="page-section">
        <h2>Selected Tracks</h2>

        {selectedTracks.length === 0 &&
          !spotifyUrl && (
            <div className="playlist-empty">
              <p>
                No tracks are selected yet.
              </p>

              <Link
                className="button"
                to="/chronicle"
              >
                Choose Tracks
              </Link>
            </div>
          )}

        {selectedTracks.length > 0 && (
          <ul className="playlist-track-list">
            {selectedTracks.map(
              (track) => (
                <li
                  className="playlist-track"
                  key={track.id}
                >
                  {track.albumImageUrl && (
                    <img
                      src={
                        track.albumImageUrl
                      }
                      alt=""
                    />
                  )}

                  <div>
                    <strong>
                      {track.name}
                    </strong>

                    <span>
                      {track.artists.join(
                        ", "
                      )}
                    </span>
                  </div>

                  <button
                    className="secondary"
                    type="button"
                    onClick={() =>
                      removeTrack(track.id)
                    }
                  >
                    Remove
                  </button>
                </li>
              )
            )}
          </ul>
        )}

        <form
          className="playlist-form"
          onSubmit={
            handleCreatePlaylist
          }
        >
          <h2>Playlist Details</h2>

          <label htmlFor="playlist-name">
            Playlist Name
          </label>

          <input
            id="playlist-name"
            type="text"
            maxLength="100"
            value={playlistName}
            onChange={(event) =>
              setPlaylistName(
                event.target.value
              )
            }
          />

          <label htmlFor="playlist-description">
            Description (optional)
          </label>

          <textarea
            id="playlist-description"
            maxLength="300"
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
          />

          <label htmlFor="playlist-privacy">
            Privacy
          </label>

          <select
            id="playlist-privacy"
            value={privacy}
            onChange={(event) =>
              setPrivacy(
                event.target.value
              )
            }
          >
            <option value="public">
              Public
            </option>

            <option value="private">
              Private
            </option>
          </select>

          <button
            type="submit"
            disabled={
              loading ||
              selectedTracks.length === 0
            }
          >
            {loading
              ? "Creating Playlist..."
              : "Create on Spotify"}
          </button>
        </form>

        {message && (
          <p
            className="status"
            role="status"
          >
            {message}
          </p>
        )}

        {spotifyUrl && (
          <a
            className="button spotify-success-link"
            href={spotifyUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open Playlist in Spotify
          </a>
        )}
      </section>
    </main>
  );
}