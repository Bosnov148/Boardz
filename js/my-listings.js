function viewMyListings() {
  const mine = db.listings.filter(l => l.ownerId === session).sort((a, b) => b.createdAt - a.createdAt);

  return `
  <div class="section-head" style="margin-top:26px">
    <div>
      <h2>My Listings</h2>
      <p>Places you've put up for rent. Only you (and admins) can edit these.</p>
    </div>
    <button class="btn btn-primary" data-action="new-listing">+ Add a listing</button>
  </div>

  ${mine.length ? `
    <div class="grid">
      ${mine.map(l => {
        const img = l.image || COVER_IMAGES[l.cover % COVER_IMAGES.length];
        const reqs = db.bookings.filter(b => b.listingId === l.id && b.status === 'Pending').length;
        return `
        <article class="card" style="cursor:default">
          <div class="card-cover" style="background-image:url('${img}')" data-action="open-listing" data-id="${l.id}">
            <span class="badge">${esc(l.type)}</span>
            ${reqs ? `<span class="badge" style="left:auto;right:12px;top:52px;background:#fdf0d5;color:#8a6a1f">${reqs} request${reqs > 1 ? 's' : ''}</span>` : ''}
          </div>
          <div class="card-body">
            <h3>${esc(l.title)}</h3>
            <p class="loc">${esc(l.street)}, ${esc(l.barangay)}</p>
            <div class="card-foot">
              <span class="price">${peso(l.price)}<small> /mo</small></span>
              <span class="rating">★ ${Number(l.rating).toFixed(1)}</span>
            </div>
            <div class="mini-actions" style="margin-top:12px">
              <button class="btn btn-ghost btn-sm" data-action="edit-listing" data-id="${l.id}">Edit</button>
              <button class="btn btn-danger btn-sm" data-action="delete-listing" data-id="${l.id}">Remove</button>
            </div>
          </div>
        </article>`;
      }).join('')}
    </div>` : emptyState('You haven\'t listed a place yet. Click "Add a listing" to get started!')}`;
}