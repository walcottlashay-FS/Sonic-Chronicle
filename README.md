# Sonic Chronicle

Sonic Chronicle is a full-stack Spotify application that turns listening history into a personal music journal.

Users can connect their Spotify account, search for music, explore top tracks, view recently played songs, save moods and notes, create Track Stories, and build Spotify playlists.

## Features

### Spotify authentication

- Spotify OAuth 2.0 Authorization Code Flow
- Dedicated Spotify Login route
- Protected frontend and backend routes
- Unauthorized users redirected to Login
- Server-side session handling
- Automatic Spotify access-token refresh
- Spotify tokens stored in PostgreSQL
- Spotify credentials and tokens kept off the frontend

### Chronicle

- Top tracks from three listening periods
- Four-week, six-month, and long-term filters
- Recently played tracks
- Vertical listening timeline
- Album artwork
- Track, artist, and album information
- Track ranking
- Played dates and times
- Loading, empty, and error states
- Responsive layouts

### Timeline memories

- Add a mood to a recently played song
- Add a personal note
- View saved moods and notes
- Edit saved memories
- Delete saved memories
- PostgreSQL memory storage
- Memory ownership connected to the Spotify user

Supported moods include:

- Happy
- Calm
- Energized
- Focused
- Nostalgic
- Sad

### Spotify Search

- Search for tracks, artists, and albums
- Submit searches using the button or keyboard
- Search validation
- Organized result cards
- Album and artist information
- Open in Spotify links
- Loading, empty, and error states

### Track Story

- Dedicated `/track/:trackId` route
- Large album artwork
- Track, artist, and album information
- Played date and time
- Open in Spotify link
- Mood selector
- Note field
- Save, edit, and delete memory controls
- Missing-track state

### Playlist creation

- Select tracks from the Chronicle
- Save selections between routes
- Remove duplicate tracks
- Remove individual selections
- Enter a playlist name
- Add an optional description
- Choose public or private
- Create the playlist through a protected backend route
- Add selected tracks to Spotify
- Open the completed playlist in Spotify

### Account

- Available Spotify profile information
- Spotify Connected status
- Song count
- Memory count
- Playlist count
- Spotify profile link
- Disconnect Spotify button

## Technology

### Frontend

- React
- React Router
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
- Railway PostgreSQL
- npm workspaces

## Project structure

```text
sonic-chronicle/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AccountPage.jsx
│   │   │   ├── PlaylistPage.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   └── TrackStoryPage.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── AuthenticatedApp.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
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
├── docs/
│   └── FRONTEND-ROUTES.md
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

Add this local redirect URI:

```text
http://127.0.0.1:3000/api/auth/callback
```

Spotify Development Mode may require test users to be added to the application allowlist.

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

Open:

```text
http://127.0.0.1:5173
```

Select **Connect Spotify** and approve the Spotify authorization request.

## Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Starts the frontend and backend together |
| `npm run build` | Creates the frontend production build |
| `npm run start` | Starts the backend server |

## Frontend routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Sends the user to Login or Chronicle |
| `/login` | Public | Connects the user’s Spotify account |
| `/chronicle` | Protected | Displays top tracks, recently played tracks, moods, and notes |
| `/search` | Protected | Searches Spotify |
| `/track/:trackId` | Protected | Displays a Track Story and memory controls |
| `/playlist` | Protected | Reviews selected tracks and creates a Spotify playlist |
| `/account` | Protected | Displays Spotify profile information, counts, and logout |

More route information is available in:

```text
docs/FRONTEND-ROUTES.md
```

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
| `GET` | `/api/profile` | Returns available Spotify profile information |
| `GET` | `/api/top-tracks` | Returns top tracks for three listening periods |
| `GET` | `/api/recently-played` | Returns recently played tracks |
| `GET` | `/api/search` | Searches Spotify |
| `POST` | `/api/playlists` | Creates a Spotify playlist and adds selected tracks |

### Timeline memories

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/memories` | Returns the current user’s memories |
| `POST` | `/api/memories` | Creates a timeline memory |
| `PATCH` | `/api/memories/:memoryId` | Updates a timeline memory |
| `DELETE` | `/api/memories/:memoryId` | Deletes a timeline memory |

Spotify data, playlist, and timeline memory routes require Spotify authorization.

## Database

The PostgreSQL database is hosted through Railway.

### `spotify_tokens`

Stores:

- Spotify user ID
- Access token
- Refresh token
- Access-token expiration time

### `timeline_memories`

Stores:

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
10. The frontend redirects unauthorized users to `/login`.

The frontend never receives the Spotify access or refresh token.

## Security

- Spotify credentials remain on the backend.
- Spotify tokens are stored in PostgreSQL.
- The frontend uses an HTTP-only session cookie.
- OAuth state validation protects the callback route.
- Protected routes require a valid Spotify connection.
- Database queries use parameterized values.
- Memory updates and deletes check the Spotify user ID.
- `.env` is excluded from Git.

The current Express session store is intended for development. Restarting the backend may require the user to connect Spotify again, even though Spotify tokens remain in PostgreSQL.

## Testing

The following tests were completed during development:

- PostgreSQL connection
- Spotify token table creation
- Timeline memory table creation
- Database-backed authentication status
- Spotify token refresh flow
- Login and protected-route redirect
- Top tracks and recently played routes
- Spotify search
- Track Story route
- Missing-track state
- Memory create, read, update, and delete
- Playlist track selection
- Duplicate-track removal
- Spotify playlist creation
- Spotify profile route
- Account page and logout
- Empty, loading, validation, and error states
- Desktop and mobile layouts
- Frontend production build

Run the production build with:

```bash
npm run build
```

## Current limitations

- Full songs do not play inside Sonic Chronicle.
- Lyrics are not provided.
- Express sessions are not stored permanently.
- Playlist selections and the playlist count use browser local storage.
- Automated tests have not been added.
- The application uses Spotify Development Mode.
- The application currently uses local frontend and backend URLs.

## Important links

- [Local frontend](http://127.0.0.1:5173)
- [Local backend health check](http://127.0.0.1:3000/api/health)
- [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- [Spotify Web API documentation](https://developer.spotify.com/documentation/web-api)
- [Sonic Chronicle GitHub repository](https://github.com/walcottlashay-FS/Sonic-Chronicle)