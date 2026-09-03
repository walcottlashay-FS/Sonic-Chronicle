import {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router";

import {
  getMemories,
  getSpotifyProfile,
  getTopTracks,
  logout,
} from "../api.js";

// show the connected spotify account
export default function AccountPage() {
  const [profile, setProfile] =
    useState(null);

  const [songCount, setSongCount] =
    useState(0);

  const [memoryCount, setMemoryCount] =
    useState(0);

  const [
    playlistCount,
    setPlaylistCount,
  ] = useState(0);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  // load profile information and account counts
  useEffect(() => {
    async function loadAccount() {
      try {
        const profileResult =
          await getSpotifyProfile();

        const topTracksResult =
          await getTopTracks();

        const memoriesResult =
          await getMemories();

        const trackIds = [];

        const ranges =
          Object.keys(
            topTracksResult.data
          );

        for (const range of ranges) {
          const tracks =
            topTracksResult.data[range];

          for (const track of tracks) {
            if (
              !trackIds.includes(
                track.id
              )
            ) {
              trackIds.push(track.id);
            }
          }
        }

        const savedPlaylistCount =
          Number(
            localStorage.getItem(
              "sonicPlaylistCount"
            ) || "0"
          );

        setProfile(
          profileResult.data
        );

        setSongCount(
          trackIds.length
        );

        setMemoryCount(
          memoriesResult.data.length
        );

        setPlaylistCount(
          savedPlaylistCount
        );
      } catch (error) {
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, []);

  // disconnect spotify and return to login
  async function disconnectSpotify() {
    try {
      await logout();

      window.location.href =
        "/login";
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (loading) {
    return (
      <main>
        <p className="status">
          Loading your account...
        </p>
      </main>
    );
  }

  return (
    <main>
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
          className="button secondary"
          to="/playlist"
        >
          Build Playlist
        </Link>

        <Link
          className="button active-page"
          to="/account"
        >
          Account
        </Link>
      </nav>

      <section className="account-page">
        <p className="eyebrow">
          YOUR MUSIC JOURNAL
        </p>

        <h1>Your Account</h1>

        {profile && (
          <div className="profile-card">
            {profile.image && (
              <img
                className="profile-image"
                src={profile.image}
                alt={profile.displayName}
              />
            )}

            <div className="profile-details">
              <h2>
                {profile.displayName}
              </h2>

              <p>@{profile.id}</p>

              <span className="connected-status">
                Spotify Connected
              </span>

              <p>
                {profile.followers} Spotify
                followers
              </p>

              <a
                className="spotify-link"
                href={profile.spotifyUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open Spotify Profile
              </a>
            </div>
          </div>
        )}

        <div className="account-counts">
          <article>
            <strong>
              {songCount}
            </strong>

            <span>Songs</span>
          </article>

          <article>
            <strong>
              {memoryCount}
            </strong>

            <span>Memories</span>
          </article>

          <article>
            <strong>
              {playlistCount}
            </strong>

            <span>Playlists</span>
          </article>
        </div>

        <button
          className="disconnect-account"
          type="button"
          onClick={disconnectSpotify}
        >
          Disconnect Spotify
        </button>

        {message && (
          <p
            className="status"
            role="status"
          >
            {message}
          </p>
        )}
      </section>
    </main>
  );
}