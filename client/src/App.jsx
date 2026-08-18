import { useEffect, useState } from 'react';
import {
  getAuthStatus,
  getRecentlyPlayed,
  getTopTracks,
  loginUrl,
  logout,
} from './api.js';
import './styles.css';

// Show the date and time a song was played.
function formatPlayedAt(playedAt) {
  const date = new Date(playedAt);

  return date.toLocaleString();
}

export default function App() {
  // Keep track of whether the user is connected to Spotify.
  const [authenticated, setAuthenticated] = useState(false);

  // Show when the app is loading.
  const [loading, setLoading] = useState(true);

  // Show updates or error messages.
  const [message, setMessage] = useState('');

  // Save the number of songs in each listening range.
  const [counts, setCounts] = useState(null);

  // Save the user's recently played songs.
  const [recentTracks, setRecentTracks] = useState(null);

  // Keep track of the page the user is viewing.
  const [activePage, setActivePage] = useState('search');

  // Check whether the user is already connected when the app opens.
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

  // Get the user's top songs for each listening range.
  async function loadTopTracks() {
    setLoading(true);
    setMessage('');

    try {
      const result = await getTopTracks();

      const trackCounts = [];

      for (const range in result.data) {
        const tracks = result.data[range];

        trackCounts.push({
          range: range,
          count: tracks.length,
        });
      }

      setCounts(trackCounts);
      setMessage('Your top tracks were loaded successfully.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Get the user's recently played songs.
  async function loadRecentlyPlayed() {
    setLoading(true);
    setMessage('');

    try {
      const result = await getRecentlyPlayed();

      setRecentTracks(result.data);

      if (result.data.length > 0) {
        setMessage('Your recently played songs were loaded.');
      } else {
        setMessage('No recently played songs were found.');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Disconnect Spotify and clear the saved information.
  async function disconnect() {
    try {
      await logout();

      setAuthenticated(false);
      setCounts(null);
      setRecentTracks(null);
      setActivePage('search');
      setMessage('Spotify disconnected.');
    } catch (error) {
      setMessage(error.message);
    }
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
              className={activePage === 'search' ? 'active-page' : 'secondary'}
              onClick={() => setActivePage('search')}
            >
              Search
            </button>

            <button
              className={
                activePage === 'chronicle' ? 'active-page' : 'secondary'
              }
              onClick={() => setActivePage('chronicle')}
            >
              Chronicle
            </button>

            <button
              className={
                activePage === 'playlist' ? 'active-page' : 'secondary'
              }
              onClick={() => setActivePage('playlist')}
            >
              Build Playlist
            </button>
          </nav>

          {/* Show the search section. */}
          {activePage === 'search' && (
            <section className="page-section">
              <h2>Search Spotify</h2>

              <p>Search for your favorite artists, albums, and songs.</p>
            </section>
          )}

      
          {activePage === 'chronicle' && (
            <section className="page-section">
              <h2>Your Chronicle</h2>

              <p>Explore your top songs and recently played music.</p>

              <div className="actions">
                <button onClick={loadTopTracks}>
                  Load Top Tracks
                </button>

                <button onClick={loadRecentlyPlayed}>
                  Load Recently Played
                </button>
              </div>

              {counts && (
                <ul className="count-list">
                  {counts.map((item) => (
                    <li key={item.range}>
                      <strong>{item.range}</strong>: {item.count} tracks
                    </li>
                  ))}
                </ul>
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
                      {recentTracks.map((track, index) => (
                        <li
                          key={`${track.id}-${track.playedAt}`}
                          className="track-card"
                        >
                          <span className="track-number">
                            {index + 1}
                          </span>

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
                              {track.artists.join(', ')} · {track.albumName}
                            </span>

                            <time dateTime={track.playedAt}>
                              {formatPlayedAt(track.playedAt)}
                            </time>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              )}
            </section>
          )}

          {activePage === 'playlist' && (
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