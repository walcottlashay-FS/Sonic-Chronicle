# Sonic Chronicle Frontend Routes

## Visual direction

Sonic Chronicle uses a dark music-journal design based on the approved Figma direction.

### Main colors

- Near-black page background
- Dark cards and navigation
- Warm white main text
- Muted gray supporting text
- Purple-to-blue gradient headings
- Spotify green for connection actions
- Colored mood and timeline markers

### Shared layout

Authenticated pages use:

- Sonic Chronicle branding
- Route-based navigation
- Responsive mobile navigation
- Loading, empty, success, and error messages
- Consistent cards, buttons, and form fields
- Spotify connection status
- Responsive desktop and mobile layouts

## Route map

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Checks authorization and sends the user to Login or Chronicle |
| `/login` | Public | Allows the user to connect Spotify |
| `/chronicle` | Protected | Displays recently played songs, top tracks, moods, and notes |
| `/search` | Protected | Searches Spotify for tracks, artists, and albums |
| `/track/:trackId` | Protected | Displays a Track Story and memory controls |
| `/playlist` | Protected | Reviews selected tracks and creates a Spotify playlist |
| `/account` | Protected | Displays Spotify profile information, counts, and logout |

## Login route

The Login screen includes:

- Sonic Chronicle branding
- A short application description
- Connect Spotify button
- Spotify authorization error message
- Loading state while authorization is checked

Authenticated users are redirected from Login to `/chronicle`.

## Chronicle route

Chronicle is the main authenticated page.

It includes:

- Recently Played view
- Top Tracks view
- Four-week, six-month, and long-term filters
- Vertical timeline for recently played songs
- Ranked cards for top tracks
- Album artwork
- Track and artist information
- Played date and time
- Mood labels
- Note previews
- Add or Edit Memory button
- Track Story links
- Track selection for playlists
- Loading, empty, and error states

Recently Played supplies exact dates for the timeline. Top Tracks are displayed by rank because Spotify does not provide exact played dates for top-track results.

Selected playlist tracks are temporarily stored in browser local storage so they remain available when the user visits `/playlist`.

## Search route

The Search page includes:

- Search field
- Artist, album, and track options
- Search button
- Keyboard form submission
- Initial instructions
- Loading state
- No-results state
- Error state
- Responsive result cards
- Open in Spotify links

## Track Story route

The original Player concept was simplified into a Track Story page.

It includes:

- Large album artwork
- Track name
- Artist and album
- Played date and time
- Open in Spotify button
- Mood selector
- Note field
- Save, edit, and delete memory controls
- Loading state
- Missing-track state
- Error state
- Responsive layout

Full playback, lyrics, and queue controls are outside the current MVP.

## Playlist route

The Playlist page includes:

- Selected-track review
- Duplicate-track removal
- Remove-track controls
- Playlist name
- Optional description
- Public or private setting
- Create on Spotify button
- Loading, validation, success, and error states
- Open in Spotify link after creation

Playlist creation is sent through the protected backend route:

```text
POST /api/playlists
```

The backend creates the playlist and adds the selected tracks using the Spotify Web API.

## Account route

The Account page includes:

- Available Spotify profile information
- Spotify Connected status
- Song count
- Memory count
- Playlist count
- Spotify profile link
- Disconnect Spotify button
- Responsive layout

Notifications, privacy settings, chapters, and journal export are outside the current MVP.

## Authorization rules

The application checks the backend authorization status before displaying protected routes.

When `authenticated` is false:

1. Protected routes redirect to `/login`.
2. The Spotify connection screen is displayed.
3. The user must authorize Spotify before returning to the application.

When `authenticated` is true:

1. Protected routes are available.
2. A user visiting Login is redirected to `/chronicle`.
3. Backend requests use the HTTP-only session cookie.

The backend also protects Spotify routes with authentication middleware. Missing or invalid Spotify authorization returns a `401` response.

## Current frontend structure

```text
client/src/
├── pages/
│   ├── AccountPage.jsx
│   ├── PlaylistPage.jsx
│   ├── SearchPage.jsx
│   └── TrackStoryPage.jsx
├── api.js
├── App.jsx
├── AuthenticatedApp.jsx
├── main.jsx
└── styles.css
```

`App.jsx` defines the routes and authentication protection.

`AuthenticatedApp.jsx` currently contains the Chronicle interface and its timeline memory controls.

The files inside `pages` contain the separate Search, Track Story, Playlist, and Account interfaces.

## Current storage

- Spotify access and refresh tokens are stored in PostgreSQL.
- Timeline moods and notes are stored in PostgreSQL.
- Selected playlist tracks are temporarily stored in browser local storage.
- The local playlist count tracks playlists created through Sonic Chronicle.
- The frontend does not receive Spotify access or refresh tokens.

## Responsive behavior

The interface supports desktop and mobile layouts.

At smaller screen sizes:

- Navigation wraps to additional lines.
- Forms stack vertically.
- Timeline and playlist cards use smaller artwork.
- Memory controls expand to the available width.
- Account count cards display in one column.
- Track Story headings and artwork resize.