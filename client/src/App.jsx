import { useEffect, useState } from 'react';
import { getAuthStatus, getRecentlyPlayed, getTopTracks, loginUrl, logout } from './api.js';
import './styles.css';

function formatPlayedAt(playedAt) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(playedAt));
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [counts, setCounts] = useState(null);
  const [recentTracks, setRecentTracks] = useState(null);

  useEffect(() => {
    getAuthStatus()
      .then(({ authenticated }) => setAuthenticated(authenticated))
      .catch((error) => setMessage(error.message))
      .finally(() => setLoading(false));
  }, []);

  async function testPipeline() {
    setLoading(true); setMessage('');
    try {
      const { data } = await getTopTracks();
      setCounts(Object.fromEntries(Object.entries(data).map(([range, tracks]) => [range, tracks.length])));
      setMessage('Success. Check the backend terminal for the clean track tables.');
    } catch (error) {
      setMessage(error.message);
    } finally { setLoading(false); }
  }

  async function loadRecentlyPlayed() {
    setLoading(true); setMessage('');
    try {
      const { data } = await getRecentlyPlayed();
      setRecentTracks(data);
      setMessage(data.length
        ? `Loaded ${data.length} recently played tracks.`
        : 'No recent plays yet. Listen to a few full songs in Spotify, then try again.');
    } catch (error) {
      setMessage(error.message);
    } finally { setLoading(false); }
  }

  async function disconnect() {
    await logout();
    setAuthenticated(false); setCounts(null); setRecentTracks(null); setMessage('Spotify disconnected.');
  }

  return <main>
    <p className="eyebrow">SPRINT 1 · DATA INGESTION</p>
    <h1>Sonic Chronicle</h1>
    <p className="intro">Turn your listening history into a visual timeline.</p>
    {loading && <p>Loading…</p>}
    {!loading && !authenticated && <a className="button" href={loginUrl}>Connect Spotify</a>}
    {!loading && authenticated && <div className="actions">
      <button onClick={testPipeline}>Fetch all time ranges</button>
      <button onClick={loadRecentlyPlayed}>Load recently played</button>
      <button className="secondary" onClick={disconnect}>Disconnect</button>
    </div>}
    {counts && <ul className="count-list">{Object.entries(counts).map(([range, count]) => <li key={range}><strong>{range}</strong>: {count} tracks</li>)}</ul>}
    {recentTracks && <section className="recent-section" aria-labelledby="recent-heading">
      <h2 id="recent-heading">Recently played</h2>
      {recentTracks.length === 0
        ? <p className="empty-state">No recent plays found yet.</p>
        : <ol className="track-list">
          {recentTracks.map((track, index) => <li key={`${track.id}-${track.playedAt}`} className="track-card">
            <span className="track-number">{index + 1}</span>
            {track.albumImageUrl && <img src={track.albumImageUrl} alt="" />}
            <div className="track-details">
              <a href={track.spotifyUrl} target="_blank" rel="noreferrer">{track.name}</a>
              <span>{track.artists.join(', ')} · {track.albumName}</span>
              <time dateTime={track.playedAt}>{formatPlayedAt(track.playedAt)}</time>
            </div>
          </li>)}
        </ol>}
    </section>}
    {message && <p className="status" role="status">{message}</p>}
  </main>;
}
