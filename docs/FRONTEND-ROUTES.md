# Sonic Chronicle Frontend Routes

## Visual direction

Sonic Chronicle will use a dark music-journal design inspired by the approved Figma screens.

### Main colors

- Near-black page background
- Dark cards and navigation
- Warm white main text
- Muted gray supporting text
- Purple-to-blue gradient headings
- Spotify green for connection actions
- Colored mood and timeline markers

### Shared layout

Authenticated pages will use:

- Sonic Chronicle branding
- Desktop sidebar navigation
- Mobile navigation
- Loading and error messages
- Consistent cards, buttons, and form fields
- Spotify connection status
- Responsive layouts

## Route map

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Checks authorization and sends the user to Login or Chronicle |
| `/login` | Public | Allows the user to connect Spotify |
| `/chronicle` | Protected | Displays recently played songs, top tracks, moods, and notes |
| `/search` | Protected | Searches Spotify for tracks, artists, and albums |
| `/track/:trackId` | Protected | Displays the Track Story and memory controls |
| `/playlist` | Protected | Reviews selected tracks and creates a Spotify playlist |
| `/account` | Protected | Displays Spotify status, counts, and logout |

## Login route

The Login screen will include:

- Sonic Chronicle name
- Short application description
- Connect Spotify button
- Spotify authorization error
- Loading state while authorization is checked

Authenticated users should not remain on the Login screen.

## Chronicle route

The Chronicle is the main authenticated page.

It will include:

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
- Track selection for playlists

Recently Played supplies exact dates for the timeline. Top Tracks will be displayed by rank because Spotify does not provide exact played dates for top-track results.

## Search route

The Search page will include:

- Search field
- Artist, album, and track options
- Search button
- Initial instructions
- Loading state
- No-results state
- Error state
- Responsive result cards
- Open in Spotify links

## Track Story route

The original Player design will become a Track Story page.

It will include:

- Large album artwork
- Track name
- Artist and album
- Played date and time when available
- Open in Spotify button
- Mood selector
- Note field
- Save, edit, and delete memory controls

Full playback, lyrics, and queue controls are outside the current MVP.

## Playlist route

The Playlist page will include:

- Selected-track review
- Remove-track controls
- Playlist name
- Optional description
- Public or private setting
- Create Playlist button
- Loading, validation, success, and error states
- Open in Spotify link after creation

## Account route

The Account page will include:

- Available Spotify profile information
- Spotify Connected status
- Song count
- Memory count
- Playlist count
- Disconnect Spotify button

Notifications, privacy settings, chapters, and journal export are outside the current MVP.

## Authorization rules

Protected routes must check the backend authorization status.

When `authenticated` is false:

1. Clear protected frontend information.
2. Send the user to `/login`.
3. Display the Spotify connection screen.

When `authenticated` is true:

1. Allow protected routes.
2. Send a user leaving Login to `/chronicle`.

A `401` response from a protected backend route should also return the user to Login.

## Planned frontend structure

```text
client/src/
├── components/
│   ├── AppLayout.jsx
│   ├── MemoryForm.jsx
│   ├── ProtectedRoute.jsx
│   └── TrackCard.jsx
├── pages/
│   ├── AccountPage.jsx
│   ├── ChroniclePage.jsx
│   ├── LoginPage.jsx
│   ├── PlaylistPage.jsx
│   ├── SearchPage.jsx
│   └── TrackStoryPage.jsx
├── App.jsx
├── api.js
├── main.jsx
└── styles.css