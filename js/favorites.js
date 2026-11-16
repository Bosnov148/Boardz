function viewFavorites() {
  const ids = db.favorites[session] || [];
  const favs = db.listings.filter(l => ids.includes(l.id));
  return `
  <div class="section-head" style="margin-top:26px">
    <div>
      <h2>Saved Places</h2>
      <p>Your shortlist of cozy corners around Davao City.</p>
    </div>
    <span class="count-pill">${favs.length} saved</span>
  </div>
  <div class="grid">${favs.length ? favs.map(cardHTML).join('') : emptyState('No saved places yet. Tap the heart on a listing to save it here.')}</div>`;
}