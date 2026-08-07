export function logTracksByRange(tracksByRange) {
  for (const [timeRange, tracks] of Object.entries(tracksByRange)) {
    console.log(`\nSonic Chronicle | Spotify top tracks | ${timeRange}`);
    console.table(
      tracks.map(({ id, name, artists, albumImageUrl }) => ({
        trackId: id,
        trackName: name,
        artists: artists.join(', '),
        albumImageUrl,
      })),
    );
  }
}
