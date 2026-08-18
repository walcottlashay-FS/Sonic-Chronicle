import { useEffect, useState } from 'react';

import {
  getAuthStatus,
  getRecentlyPlayed,
  getTopTracks,
  loginUrl,
  logout,
  searchSpotify,
} from './api.js';

import './styles.css';

// format date and time
function formatPlayedAt(playedAt) {
  const date = new Date(playedAt);

  return date.toLocaleString();
}

export default function App() {
  // app information
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activePage, setActivePage] = useState('search');

  // listening history
  const [counts, setCounts] = useState(null);
  const [recentTracks, setRecentTracks] = useState(null);

  // search information
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('artist');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

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

  // load top tracks
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
      setMessage('Your top tracks were loaded.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  // load recently played
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

  // search spotify
  async function handleSearch(event) {
    event.preventDefault();

    if (!searchTerm.trim()) {
      setMessage('Please enter something to search.');
      return;
    }

    setSearchLoading(true);
    setSearchResults([]);
    setMessage('');

    try {
      const result = await searchSpotify(
        searchTerm.trim(),
        searchType
      );

      setSearchResults(result.data);

      if (result.data.length === 0) {
        setMessage('No results found.');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSearchLoading(false);
    }
  }

  // disconnect spotify
  async function disconnect() {
    try {
      await logout();

      setAuthenticated(false);
      setCounts(null);
      setRecentTracks(null);
      setSearchResults([]);
      setSearchTerm('');
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
              className={
                activePage === 'search' ? 'active-page' : 'secondary'
              }
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

          {activePage === 'search' && (
            <section className="page-section">
              <h2>Search Spotify</h2>

              <p>
                Search for your favorite artists, albums, and songs.
              </p>

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
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((item) => (
                    <div className="search-card" key={item.id}>
                      {item.image && (
                        <img src={item.image} alt={item.name} />
                      )}

                      <div className="search-details">
                        <h3>{item.name}</h3>

                        {item.artists.length > 0 && (
                          <p>{item.artists.join(', ')}</p>
                        )}

                        {item.albumName && (
                          <p>{item.albumName}</p>
                        )}

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

          {activePage === 'chronicle' && (
            <section className="page-section">
              <h2>Your Chronicle</h2>

              <p>
                Explore your top songs and recently played music.
              </p>

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

          <button
            className="secondary disconnect-button"
            onClick={disconnect}
          >
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