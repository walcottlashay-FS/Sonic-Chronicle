# Sonic Chronicle

Sonic Chronicle is a Spotify-powered music history application. It allows users to connect their Spotify account, search for music, view recently played songs, and explore their top tracks through a visual listening timeline.

The purpose of Sonic Chronicle is to go beyond basic music statistics and transform Spotify listening data into a personal music story. In future versions, users may be able to connect meaningful songs with memories, notes, moods, dates, and photos.

This application could benefit Spotify listeners, music lovers, playlist creators, and anyone who connects music with important moments.

## Week 1 features

- Spotify login using OAuth 2.0
- Server-side session and token storage
- Automatic Spotify access-token refresh
- Top tracks from three listening periods
- Recently played tracks
- Authentication and Spotify API error handling
- Spotify credentials and tokens kept on the backend

## Week 2 features

- Authenticated application navigation
- Search, Chronicle, and Build Playlist sections
- Spotify search for artists, albums, and tracks
- Search validation and organized results
- Responsive search result cards
- Top-track listening timeline
- Last four weeks, last six months, and long-term listening ranges
- Track artwork, ranking, artist, and album information
- Interactive track details
- Recently played music
- Loading, empty, and error messages
- Responsive desktop, tablet, and mobile layouts

## Technology used

- React
- Vite
- JavaScript
- CSS
- Node.js
- Express
- Spotify Web API
- Express sessions
- Git and GitHub

## Project structure

```text
sonic-chronicle/
├── client/
│   ├── src/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── index.js
│   └── package.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

Before running the project, you will need:

- Node.js 20 or newer
- npm 10 or newer
- A modern web browser
- A Spotify account
- A Spotify application created in the Spotify Developer Dashboard

## Getting started

1. Create an application in the Spotify Developer Dashboard.

2. Add this redirect URI to the Spotify application:

   ```text
   http://127.0.0.1:3000/api/auth/callback
   ```

3. Copy `.env.example` and rename the copy to `.env`.

4. Add the following information to `.env`:

   ```text
   SPOTIFY_CLIENT_ID=
   SPOTIFY_CLIENT_SECRET=
   SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/auth/callback
   SESSION_SECRET=
   ```

5. From the main project folder, install the packages:

   ```bash
   npm install
   ```

6. Start the frontend and backend:

   ```bash
   npm run dev
   ```

7. Open the application:

   ```text
   http://127.0.0.1:5173
   ```

8. Select **Connect Spotify** and approve the connection.

## Application sections

### Search

Users can search Spotify for artists, albums, and tracks. Results display available artwork, names, artist information, album information, and Spotify links.

### Chronicle

Users can load their top tracks and switch between three listening periods:

- Last four weeks
- Last six months
- Long-term listening history

Each track displays its ranking, artwork, title, artist, and album. Users can select a track to view more information.

The Chronicle section also displays recently played songs and the date and time each song was played.

### Build Playlist

This section is currently a placeholder. Playlist creation and Spotify export will be added during Week 3.

## API routes

```text
GET  /api/health
GET  /api/auth/login
GET  /api/auth/callback
GET  /api/auth/status
POST /api/auth/logout
GET  /api/top-tracks
GET  /api/recently-played
GET  /api/search
```

## Security notes

Spotify credentials and access tokens stay on the backend. The frontend uses the server session through an HTTP-only cookie.

The `.env` file is ignored by Git and should never be uploaded to GitHub.

The current in-memory session storage is intended for local development. Restarting the backend may clear the session and require the user to reconnect Spotify.

## Week 3 plans

- Add playlist track selection
- Add a playlist name and description form
- Create a protected playlist API endpoint
- Create playlists through the Spotify Web API
- Export selected tracks to Spotify
- Complete final testing and documentation
- Prepare the application for deployment

## Important links

- Frontend: http://127.0.0.1:5173
- Backend health: http://127.0.0.1:3000/api/health
- Spotify Developer Dashboard: https://developer.spotify.com/dashboard
- Spotify Web API documentation: https://developer.spotify.com/documentation/web-api