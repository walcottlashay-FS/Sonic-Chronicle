# Sonic Chronicle

Sonic Chronicle is a Spotify-powered music history application. Its MVP authenticates a Spotify user, retrieves their top tracks across short-, medium-, and long-term listening windows, and prepares that data for a visual timeline and playlist export.

## Sprint 1 features

- Spotify OAuth 2.0 Authorization Code Flow with CSRF `state` validation
- Server-side token/session storage; no Spotify secret or bearer token reaches React
- Automatic access-token refresh before expiration
- Top-track ingestion for `short_term`, `medium_term`, and `long_term`
- Clean server-side `console.table` output for instructor verification
- Network, Spotify API, authentication, and rate-limit error handling

## Architecture

```text
sonic-chronicle/
├── client/                  # React + Vite UI (port 5173)
│   └── src/
│       ├── api.js           # Calls the decoupled backend
│       ├── App.jsx          # Login, status, and test-fetch UI
│       └── main.jsx
├── server/                  # Node.js + Express API (port 3000)
│   └── src/
│       ├── config/env.js    # Validated environment configuration
│       ├── middleware/      # Error and authentication middleware
│       ├── routes/          # Auth and top-track HTTP routes
│       ├── services/        # Spotify OAuth/API integration
│       ├── utils/           # Async and logging helpers
│       └── index.js
├── .env.example
└── .gitignore
```

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- A modern browser
- A free Spotify account
- A Spotify app created in the Spotify Developer Dashboard

## Getting started

1. In the Spotify Developer Dashboard, create an app.
2. Add this exact redirect URI: `http://127.0.0.1:3000/api/auth/callback`.
3. Copy `.env.example` to `.env` and enter the Spotify client ID and secret.
4. Generate a session secret, for example: `openssl rand -base64 32`.
5. From the project root, run `npm install`.
6. Start both applications with `npm run dev`.
7. Open `http://127.0.0.1:5173` and select **Connect Spotify**.
8. After authorization, select **Fetch all time ranges**.
9. Show the backend terminal's three `console.table` outputs in the SCRUM video.

## Important links

- Frontend: http://127.0.0.1:5173
- Backend health: http://127.0.0.1:3000/api/health
- Spotify Dashboard: https://developer.spotify.com/dashboard
- Spotify top-items reference: https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks

## Security notes

The `.env` file is ignored by Git. OAuth tokens are stored in the server session and represented in the browser only by an `httpOnly`, `sameSite=lax` cookie. The default in-memory session store is suitable only for Sprint 1 local development. Before deployment, use Redis or another persistent session store and HTTPS-secure cookies.

Spotify access tokens expire after about one hour. This app refreshes an access token five minutes before expiration. If refresh authorization becomes invalid, it clears the session and asks the user to reconnect.

## Planned MVP sprints

- Sprint 1: repository, design direction, OAuth, token lifecycle, ingestion proof
- Sprint 2: normalize audio/track data and render the interactive timeline
- Sprint 3: filters, playlist creation/export, QA, deployment, documentation
