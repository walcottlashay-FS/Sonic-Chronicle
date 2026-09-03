import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import {
  createMemory,
  deleteMemory,
  getMemories,
  updateMemory,
} from "../api.js";

// format the spotify played date
function formatPlayedAt(playedAt) {
  if (!playedAt) {
    return "Played time unavailable";
  }

  return new Date(playedAt).toLocaleString();
}

// show one track and its saved memory
export default function TrackStoryPage() {
  const { trackId } = useParams();

  const [track, setTrack] = useState(null);
  const [memory, setMemory] = useState(null);
  const [mood, setMood] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // load the selected track and its memory
  useEffect(() => {
    async function loadTrackStory() {
      const savedTrack = localStorage.getItem("sonicTrackStory");

      if (!savedTrack) {
        setLoading(false);
        return;
      }

      try {
        const selectedTrack = JSON.parse(savedTrack);

        if (selectedTrack.id !== trackId) {
          setLoading(false);
          return;
        }

        setTrack(selectedTrack);

        const result = await getMemories();

        const savedMemory = result.data.find((item) => {
          const memoryDate = new Date(item.played_at).getTime();
          const trackDate = new Date(selectedTrack.playedAt).getTime();

          return item.track_id === trackId && memoryDate === trackDate;
        });

        if (savedMemory) {
          setMemory(savedMemory);
          setMood(savedMemory.mood || "");
          setNote(savedMemory.note || "");
        }
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadTrackStory();
  }, [trackId]);

  // save a new memory or update the current memory
  async function saveTrackMemory(event) {
    event.preventDefault();

    const cleanNote = note.trim();

    if (!mood && !cleanNote) {
      setMessage("Choose a mood or write a note before saving.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      let result;

      if (memory) {
        result = await updateMemory(memory.id, mood, cleanNote);
        setMessage("Your track story was updated.");
      } else {
        result = await createMemory(
          track.id,
          track.playedAt,
          mood,
          cleanNote,
        );
        setMessage("Your track story was saved.");
      }

      setMemory(result.data);
      setMood(result.data.mood || "");
      setNote(result.data.note || "");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  // delete the saved memory
  async function removeTrackMemory() {
    const shouldDelete = window.confirm("Delete this track story?");

    if (!shouldDelete) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      await deleteMemory(memory.id);

      setMemory(null);
      setMood("");
      setNote("");
      setMessage("Your track story was deleted.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main>
        <p className="status">Loading track story...</p>
      </main>
    );
  }

  if (!track) {
    return (
      <main className="missing-track">
        <p className="eyebrow">TRACK STORY</p>
        <h1>Track Not Found</h1>
        <p className="intro">
          Select a recently played song from your Chronicle first.
        </p>
        <Link className="button" to="/chronicle">
          Return to Chronicle
        </Link>
      </main>
    );
  }

  return (
    <main>
      <nav className="navigation" aria-label="Main navigation">
        <Link className="button secondary" to="/chronicle">
          Chronicle
        </Link>

        <Link className="button secondary" to="/search">
          Search
        </Link>

        <Link className="button secondary" to="/playlist">
          Build Playlist
        </Link>
      </nav>

      <section className="track-story">
        <p className="eyebrow">TRACK STORY</p>

        {track.albumImageUrl && (
          <img
            className="track-story-artwork"
            src={track.albumImageUrl}
            alt={track.albumName}
          />
        )}

        <div className="track-story-heading">
          <h1>{track.name}</h1>
          <p>{track.artists.join(", ")}</p>
          <p>{track.albumName}</p>
          <time dateTime={track.playedAt}>
            {formatPlayedAt(track.playedAt)}
          </time>

          <a
            className="spotify-link"
            href={track.spotifyUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open in Spotify
          </a>
        </div>

        <form className="story-memory-form" onSubmit={saveTrackMemory}>
          <h2>{memory ? "Edit Your Memory" : "Add Your Memory"}</h2>

          <label htmlFor="track-mood">Mood</label>
          <select
            id="track-mood"
            value={mood}
            onChange={(event) => setMood(event.target.value)}
          >
            <option value="">Choose a mood</option>
            <option value="happy">Happy</option>
            <option value="calm">Calm</option>
            <option value="energized">Energized</option>
            <option value="focused">Focused</option>
            <option value="nostalgic">Nostalgic</option>
            <option value="sad">Sad</option>
          </select>

          <label htmlFor="track-note">Note</label>
          <textarea
            id="track-note"
            maxLength="500"
            placeholder="What does this song remind you of?"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />

          <div className="memory-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Memory"}
            </button>

            {memory && (
              <button
                className="delete-memory"
                type="button"
                onClick={removeTrackMemory}
                disabled={saving}
              >
                Delete Memory
              </button>
            )}
          </div>
        </form>

        {message && (
          <p className="status" role="status">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}
