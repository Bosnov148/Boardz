function viewAdmin() {
  if (!isAdmin()) return emptyState('Admin access required.');

  const totalMonthly = db.listings.reduce((s, l) => s + Number(l.price), 0);
  const pending = db.bookings.filter(b => b.status === 'Pending').length;

  const stats = `
    <div class="stats">
      <div class="stat"><div class="k">Registered users</div><div class="v">${db.users.length}</div></div>
      <div class="stat"><div class="k">Total listings</div><div class="v">${db.listings.length}</div></div>
      <div class="stat"><div class="k">Booking requests</div><div class="v accent">${db.bookings.length}</div></div>
      <div class="stat"><div class="k">Pending approvals</div><div class="v accent">${pending}</div></div>
      <div class="stat"><div class="k">Listed monthly value</div><div class="v" style="font-size:26px">${peso(totalMonthly)}</div></div>
    </div>`;

  const tabs = `
    <div class="tabs">
      ${['overview','users','listings','bookings'].map(t =>
        `<button class="tab ${state.adminTab === t ? 'active' : ''}" data-action="admin-tab" data-tab="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`
      ).join('')}
    </div>`;

  let body = '';

  if (state.adminTab === 'overview') {
    const recent = db.bookings.slice().sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
    body = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Recent request</th><th>Renter</th><th>Move-in</th><th>Status</th></tr></thead>
          <tbody>
            ${recent.length ? recent.map(b => {
              const l = db.listings.find(x => x.id === b.listingId);
              const r = db.users.find(u => u.id === b.renterId);
              return `<tr>
                <td><strong style="color:var(--brown);font-weight:700">${esc(l ? l.title : '(deleted)')}</strong></td>
                <td>${esc(r ? r.name : '—')}</td>
                <td>${esc(b.moveIn)}</td>
                <td><span class="status ${b.status}">${b.status}</span></td>
              </tr>`;
            }).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:30px">No requests yet.</td></tr>'}
          </tbody>
        </table>
      </div>`;
  }

  if (state.adminTab === 'users') {
    body = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Listings</th><th>Actions</th></tr></thead>
          <tbody>
            ${db.users.map(u => {
              const count = db.listings.filter(l => l.ownerId === u.id).length;
              return `<tr>
                <td><strong style="color:var(--brown);font-weight:700">${esc(u.name)}</strong></td>
                <td>${esc(u.email)}</td>
                <td><span class="status ${u.role === 'admin' ? 'Approved' : 'Pending'}">${u.role}</span></td>
                <td>${count}</td>
                <td>
                  ${u.id === session
                    ? '<span style="font-size:12px;color:var(--muted)">— you —</span>'
                    : `<button class="btn btn-danger btn-sm" data-action="admin-delete-user" data-id="${u.id}">Delete</button>`}
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  }

  if (state.adminTab === 'listings') {
    body = `
      <div style="margin-bottom:16px">
        <button class="btn btn-primary" data-action="new-listing">+ Add listing as admin</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Listing</th><th>Host</th><th>Location</th><th>Rent</th><th>Actions</th></tr></thead>
          <tbody>
            ${db.listings.map(l => {
              const owner = db.users.find(u => u.id === l.ownerId);
              return `<tr>
                <td><strong style="color:var(--brown);font-weight:700">${esc(l.title)}</strong><br><span style="font-size:12px;color:var(--muted)">${esc(l.type)}</span></td>
                <td>${esc(owner ? owner.name : '—')}</td>
                <td>${esc(l.street)}, ${esc(l.barangay)}</td>
                <td>${peso(l.price)}</td>
                <td>
                  <div class="mini-actions">
                    <button class="btn btn-ghost btn-sm" data-action="edit-listing" data-id="${l.id}">Edit</button>
                    <button class="btn btn-danger btn-sm" data-action="delete-listing" data-id="${l.id}">Delete</button>
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  }

  if (state.adminTab === 'bookings') {
    body = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Listing</th><th>Renter</th><th>Host</th><th>Move-in</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${db.bookings.length ? db.bookings.map(b => {
              const l = db.listings.find(x => x.id === b.listingId);
              const r = db.users.find(u => u.id === b.renterId);
              const o = db.users.find(u => u.id === b.ownerId);
              return `<tr>
                <td><strong style="color:var(--brown);font-weight:700">${esc(l ? l.title : '(deleted)')}</strong></td>
                <td>${esc(r ? r.name : '—')}</td>
                <td>${esc(o ? o.name : '—')}</td>
                <td>${esc(b.moveIn)}</td>
                <td><span class="status ${b.status}">${b.status}</span></td>
                <td>
                  <div class="mini-actions">
                    <select class="field" style="padding:6px 10px;font-size:12px" data-action="admin-status" data-id="${b.id}">
                      ${['Pending','Approved','Declined','Completed'].map(s => `<option ${b.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                    <button class="btn btn-danger btn-sm" data-action="admin-delete-booking" data-id="${b.id}">Delete</button>
                  </div>
                </td>
              </tr>`;
            }).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:30px">No bookings yet.</td></tr>'}
          </tbody>
        </table>
      </div>`;
  }

  return `
    <div class="section-head" style="margin-top:26px">
      <div>
        <h2>Admin Dashboard</h2>
        <p>Full control over users, listings, and booking requests across BOARDz.</p>
      </div>
    </div>
    ${stats}
    ${tabs}
    ${body}`;
}