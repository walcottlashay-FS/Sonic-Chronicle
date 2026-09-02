# Sonic Chronicle

Sonic Chronicle is a full-stack Spotify application that turns listening history into a personal music journal. Users can connect their Spotify account, search for music, explore top tracks, view recently played songs, and attach moods and notes to specific listening moments.

## Features

### Week 1 — Spotify connection and data

- Spotify OAuth 2.0 Authorization Code Flow
- Server-side authorization and session handling
- Automatic Spotify access-token refresh
- Top tracks from three listening periods
- Recently played tracks
- Spotify API error handling
- Credentials and tokens kept off the frontend

### Week 2 — Search and Chronicle

- Authenticated application navigation
- Search, Chronicle, and Build Playlist sections
- Spotify search for artists, albums, and tracks
- Search validation and organized results
- Top-track listening timeline
- Four-week, six-month, and long-term listening ranges
- Track artwork, ranking, artist, and album information
- Interactive track details
- Recently played dates and times
- Loading, empty, and error states
- Responsive layouts

### Week 3 — Database and memories

- Railway PostgreSQL database
- Spotify access and refresh tokens saved in PostgreSQL
- Database-backed authentication status
- Automatic token refresh before protected requests
- Refreshed tokens saved back to PostgreSQL
- Protected Spotify and memory routes
- Timeline memory database table
- Create, read, update, and delete memory routes
- Mood and note controls for recently played songs
- Saved mood and note previews
- Memory validation and error messages
- Production frontend build verification

## Technology

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Node.js
- Express
- Express Session
- PostgreSQL
- Spotify Web API

### Development and deployment

- Git
- GitHub
- Railway
- npm workspaces

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
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── env.js
│   │   ├── middleware/
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── memories.routes.js
│   │   │   └── tracks.routes.js
│   │   ├── services/
│   │   ├── utils/
│   │   └── index.js
│   └── package.json
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

Before running the project, install or create the following:

- Node.js 20 or newer
- npm 10 or newer
- A modern web browser
- A Spotify Premium account
- A Spotify application in the Spotify Developer Dashboard
- A PostgreSQL database

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/walcottlashay-FS/Sonic-Chronicle.git
```

Enter the project folder:

```bash
cd Sonic-Chronicle
```

### 2. Install the packages

Run this command from the main project folder:

```bash
npm install
```

### 3. Configure Spotify

Create an application in the Spotify Developer Dashboard.

Add the following redirect URI:

```text
http://127.0.0.1:3000/api/auth/callback
```

### 4. Configure the environment

Use `.env.example` as a guide and create:

```text
server/.env
```

Add the required values:

```text
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/auth/callback
SESSION_SECRET=
DATABASE_URL=
CLIENT_URL=http://127.0.0.1:5173
PORT=3000
```

Do not commit the `.env` file or share its values.

### 5. Start the application

Run the frontend and backend together:

```bash
npm run dev
```

Open the frontend:

```text
http://127.0.0.1:5173
```

Select **Connect Spotify** and approve the Spotify authorization request.

## Available scripts

Run these scripts from the main project folder.

| Command | Purpose |
|---|---|
| `npm run dev` | Starts the frontend and backend together |
| `npm run build` | Creates the frontend production build |
| `npm run start` | Starts the backend server |

## Application sections

### Search

Users can search Spotify for artists, albums, and tracks.

Search results can display:

- Artwork
- Name
- Artist
- Album
- Open in Spotify link

### Chronicle

The Chronicle displays top tracks from:

- Last four weeks
- Last six months
- Long-term listening history

Top-track cards display the track’s rank, artwork, title, artist, and album.

The Chronicle also displays recently played songs with the date and time each song was played.

### Timeline memories

Users can add a memory to a recently played song by:

- Selecting a mood
- Writing a note
- Selecting a mood and writing a note

Saved memories can be viewed, updated, and deleted.

Supported moods include:

- Happy
- Calm
- Energized
- Focused
- Nostalgic
- Sad

### Build Playlist

The Build Playlist section is currently a placeholder. Track selection and Spotify playlist creation are planned for Week 4.

## API routes

### Application and authentication

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/health` | Checks whether the backend is running |
| `GET` | `/api/auth/login` | Starts Spotify authorization |
| `GET` | `/api/auth/callback` | Completes Spotify authorization |
| `GET` | `/api/auth/status` | Returns the current authorization status |
| `POST` | `/api/auth/logout` | Ends the current session |

### Spotify data

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/top-tracks` | Returns top tracks for three listening periods |
| `GET` | `/api/recently-played` | Returns recently played tracks |
| `GET` | `/api/search` | Searches Spotify |

### Timeline memories

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/memories` | Returns the current user’s memories |
| `POST` | `/api/memories` | Creates a timeline memory |
| `PATCH` | `/api/memories/:memoryId` | Updates a timeline memory |
| `DELETE` | `/api/memories/:memoryId` | Deletes a timeline memory |

The Spotify data and timeline memory routes require Spotify authorization.

## Database

### spotify_tokens

The `spotify_tokens` table stores:

- Spotify user ID
- Access token
- Refresh token
- Access-token expiration time

### timeline_memories

The `timeline_memories` table stores:

- Memory ID
- Spotify user ID
- Spotify track ID
- Played date and time
- Mood
- Note
- Created date
- Updated date

Each memory belongs to the connected Spotify user. Update and delete queries include the Spotify user ID so one user cannot change another user’s memory.

## Authentication flow

1. The user selects **Connect Spotify**.
2. The backend redirects the user to Spotify.
3. Spotify returns an authorization code.
4. The backend exchanges the code for Spotify tokens.
5. The backend gets the Spotify user ID.
6. The tokens are saved in PostgreSQL.
7. Protected middleware checks the session and database.
8. Expiring access tokens are refreshed before Spotify requests.
9. Refreshed tokens are saved back to PostgreSQL.

The frontend never receives the Spotify access or refresh token.

## Security

- Spotify credentials remain on the backend.
- Spotify tokens are stored in PostgreSQL.
- The frontend uses an HTTP-only session cookie.
- OAuth state validation helps protect the callback route.
- Protected routes require a valid Spotify connection.
- Database queries use parameterized values.
- Memory updates and deletes check the Spotify user ID.
- `.env` is excluded from Git.

The current Express session store is intended for development. Restarting the backend may require the user to connect Spotify again, even though Spotify tokens remain in PostgreSQL.

## Week 3 testing

The following tests were completed:

- PostgreSQL connection passed
- Spotify token table created successfully
- Timeline memory table created successfully
- Database-backed authentication status passed
- Spotify token refresh flow passed
- Memory create route passed
- Memory read route passed
- Memory update route passed
- Memory delete route passed
- Mood and note frontend controls passed
- Memory form validation passed
- Frontend production build passed

Run the production build with:

```bash
npm run build
```

## Week 4 plans

Week 4 will complete the frontend using separate React routes:

- `/login`
- `/chronicle`
- `/search`
- `/track/:trackId`
- `/playlist`
- `/account`

Planned Week 4 work includes:

- Create the dedicated Spotify Login screen
- Return unauthorized users to Login
- Add React Router
- Implement the final Figma-inspired visual design
- Separate Search into its own route
- Build the Track Story route
- Complete track selection
- Create Spotify playlists
- Complete the Account route
- Test desktop and mobile layouts
- Prepare the application for deployment
- Complete the final documentation and demonstration

## Current limitations

- Full songs do not play inside Sonic Chronicle
- Lyrics are not provided
- Playlist creation is not complete
- Express sessions are not stored permanently
- Automated tests have not been added
- The application uses Spotify Development Mode

## Important links

- [Frontend](http://127.0.0.1:5173)
- [Backend health check](http://127.0.0.1:3000/api/health)
- [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- [Spotify Web API documentation](https://developer.spotify.com/documentation/web-api)
- [Sonic Chronicle GitHub repository](https://github.com/walcottlashay-FS/Sonic-Chronicle)