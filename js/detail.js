function viewDetail() {
  const l = db.listings.find(x => x.id === state.detailId);
  if (!l) return `<div class="empty"><span>—</span><p>That listing no longer exists.</p></div>`;

  const img = l.image || COVER_IMAGES[l.cover % COVER_IMAGES.length];
  const owner = db.users.find(u => u.id === l.ownerId) || { name: 'Unknown host', email: '' };
  const user = me();
  const isOwner = session === l.ownerId;
  const canManage = user && (user.role === 'admin' || isOwner);
  const fav = isFav(l.id);
  const hasThread = hasThreadWith(l.id, l.ownerId);

  let actionBox = '';
  if (!session) {
    actionBox = `<button class="btn btn-primary btn-block" data-action="open-auth" data-mode="login">Log in to request a rental</button>`;
  } else if (isOwner) {
    actionBox = `<p class="loc" style="justify-content:center">This is your own listing.</p>`;
  } else if (user.role === 'admin') {
    actionBox = `<p class="loc" style="justify-content:center">Admins manage listings — log in as a renter to book.</p>`;
  } else {
    const existing = db.bookings.find(b => b.listingId === l.id && b.renterId === session && b.status !== 'Declined');
    if (existing) {
      actionBox = `
        <p class="loc" style="justify-content:center;margin-bottom:10px">You have a request for this place</p>
        <span class="status ${existing.status}" style="display:block;text-align:center;padding:11px">${existing.status}</span>`;
    } else {
      actionBox = `
        <form data-form="booking" data-id="${l.id}">
          <div class="row">
            <label>Move-in date</label>
            <input class="field" type="date" name="moveIn" required min="${todayISO()}">
          </div>
          <div class="row">
            <label>Duration</label>
            <select class="field" name="months">
              ${[1,2,3,6,12].map(m => `<option value="${m}">${m} month${m > 1 ? 's' : ''}</option>`).join('')}
            </select>
          </div>
          <div class="row">
            <label>Message to host (optional)</label>
            <textarea class="field" name="message" rows="2" placeholder="Say hello and ask a question…"></textarea>
          </div>
          <button class="btn btn-primary btn-block">Request to rent</button>
        </form>`;
    }
  }

  const messageBtn = (session && !isOwner && user.role !== 'admin') ? `
    <button class="btn btn-ghost btn-block" style="margin-top:10px" data-action="open-conversation" data-listing="${l.id}" data-to="${l.ownerId}">
      ${hasThread ? 'View conversation' : 'Message host'}
    </button>` : '';

  return `
  <a class="back-link" data-action="nav" data-view="home">← Back to browse</a>

  <div class="detail">
    <div>
      <div class="detail-hero" style="background-image:url('${img}')">
        <span class="badge">${esc(l.type)}</span>
      </div>

      <div class="panel">
        <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap">
          <div>
            <h1>${esc(l.title)}</h1>
            <p class="loc">${esc(l.street)}, Barangay ${esc(l.barangay)}, Davao City</p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="heart ${fav ? 'on' : ''}" style="position:static;width:auto;padding:0 16px;border-radius:999px;height:38px;font-size:13px;font-weight:800;gap:6px" data-action="fav" data-id="${l.id}">
              ${fav ? 'Saved' : 'Save'}
            </button>
            ${canManage ? `
              <button class="btn btn-ghost btn-sm" data-action="edit-listing" data-id="${l.id}">Edit</button>
              <button class="btn btn-danger btn-sm" data-action="delete-listing" data-id="${l.id}">Delete</button>` : ''}
          </div>
        </div>

        <div style="display:flex;gap:14px;align-items:center;margin-top:18px;flex-wrap:wrap">
          <span class="rating">★ ${Number(l.rating).toFixed(1)} rating</span>
          <span class="amenity">${peso(l.price)} / month</span>
          ${l.amenities.includes('Aircon') ? '<span class="amenity">Air-conditioned</span>' : ''}
        </div>

        <p class="detail-desc">${esc(l.description)}</p>

        <h3 style="margin-top:26px;font-size:19px;color:var(--brown);font-weight:800">What this place offers</h3>
        <div class="amenities">
          ${l.amenities.map(a => `<span class="amenity">${esc(a)}</span>`).join('')}
        </div>
      </div>

      <div class="panel">
        <h3 style="font-size:19px;color:var(--brown);margin-bottom:14px;font-weight:800">Reviews from renters</h3>
        ${(l.reviews && l.reviews.length)
          ? l.reviews.map(r => `
              <div class="review">
                <div class="review-head"><strong>${esc(r.name)}</strong><span>★ ${Number(r.rating).toFixed(1)}</span></div>
                <p>${esc(r.text)}</p>
              </div>`).join('')
          : `<p class="loc">No reviews yet — be the first to rent and share your experience.</p>`}
      </div>
    </div>

    <aside class="sticky-side">
      <div class="booking-card">
        <span class="price">${peso(l.price)}</span>
        <span class="per">per month · utilities may vary</span>
        ${actionBox}
        ${messageBtn}
        <div style="border-top:1.5px dashed var(--line);margin-top:20px;padding-top:18px">
          <p style="font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:11px">Hosted by</p>
          <div class="owner-card">
            <span class="avatar">${esc(owner.name.charAt(0).toUpperCase())}</span>
            <div>
              <strong>${esc(owner.name)}</strong>
              <span>${esc(l.barangay)}, Davao City</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>`;
}