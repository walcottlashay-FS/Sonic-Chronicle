import { useEffect, useState } from 'react';
import { getAuthStatus, getTopTracks, loginUrl, logout } from './api.js';
import './styles.css';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [counts, setCounts] = useState(null);

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

  async function disconnect() {
    await logout();
    setAuthenticated(false); setCounts(null); setMessage('Spotify disconnected.');
  }

  return <main>
    <p className="eyebrow">SPRINT 1 · DATA INGESTION</p>
    <h1>Sonic Chronicle</h1>
    <p className="intro">Turn your listening history into a visual timeline.</p>
    {loading && <p>Loading…</p>}
    {!loading && !authenticated && <a className="button" href={loginUrl}>Connect Spotify</a>}
    {!loading && authenticated && <div className="actions">
      <button onClick={testPipeline}>Fetch all time ranges</button>
      <button className="secondary" onClick={disconnect}>Disconnect</button>
    </div>}
    {counts && <ul>{Object.entries(counts).map(([range, count]) => <li key={range}><strong>{range}</strong>: {count} tracks</li>)}</ul>}
    {message && <p className="status" role="status">{message}</p>}
  </main>;
}
