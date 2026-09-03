import { useState } from "react";
import { Link } from "react-router";

import { searchSpotify } from "../api.js";

// show spotify search and its results
export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("track");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [message, setMessage] = useState("");

  // submit the search form
  async function handleSearch(event) {
    event.preventDefault();

    const cleanSearchTerm = searchTerm.trim();

    if (!cleanSearchTerm) {
      setMessage("Please enter something to search.");
      return;
    }

    setSearchLoading(true);
    setSearchResults([]);
    setHasSearched(true);
    setMessage("");

    try {
      const result = await searchSpotify(cleanSearchTerm, searchType);

      setSearchResults(result.data);

      if (result.data.length === 0) {
        setMessage("No Spotify results were found.");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSearchLoading(false);
    }
  }

  return (
    <main>
      <p className="eyebrow">DISCOVER YOUR NEXT CHAPTER</p>

      <h1>Sonic Chronicle</h1>

      <p className="intro">
        Search for the music connected to your moments.
      </p>

      <nav className="navigation" aria-label="Main navigation">
        <Link className="button secondary" to="/chronicle">
          Chronicle
        </Link>

        <Link className="button active-page" to="/search">
          Search
        </Link>

        <Link className="button secondary" to="/playlist">
          Build Playlist
        </Link>
      </nav>

      <section className="page-section">
        <h2>Search Spotify</h2>

        <p>Search for tracks, artists, or albums.</p>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            className="search-input"
            type="search"
            placeholder="Search your songs..."
            aria-label="Search Spotify"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <select
            className="search-select"
            aria-label="Search type"
            value={searchType}
            onChange={(event) => setSearchType(event.target.value)}
          >
            <option value="track">Tracks</option>
            <option value="artist">Artists</option>
            <option value="album">Albums</option>
          </select>

          <button type="submit" disabled={searchLoading}>
            {searchLoading ? "Searching..." : "Search"}
          </button>
        </form>

        {message && (
          <p className="status" role="status">
            {message}
          </p>
        )}

        {!searchLoading &&
          hasSearched &&
          searchResults.length === 0 &&
          !message && (
            <p className="empty-state">No results were found.</p>
          )}

        {searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((item) => (
              <article className="search-card" key={item.id}>
                {item.image && <img src={item.image} alt="" />}

                <div className="search-details">
                  <h3>{item.name}</h3>

                  {item.artists && item.artists.length > 0 && (
                    <p>{item.artists.join(", ")}</p>
                  )}

                  {item.albumName && <p>Album: {item.albumName}</p>}

                  <a
                    href={item.spotifyUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Spotify
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
