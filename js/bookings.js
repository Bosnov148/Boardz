function bookingRow(b, role) {
  const l = db.listings.find(x => x.id === b.listingId);
  const other = db.users.find(u => u.id === (role === 'owner' ? b.renterId : b.ownerId));
  const title = l ? l.title : '(deleted listing)';
  return `
    <tr>
      <td>
        <strong style="color:var(--brown);font-weight:700">${esc(title)}</strong><br>
        <span style="font-size:12px;color:var(--muted)">${l ? esc(l.street) + ', ' + esc(l.barangay) : '—'}</span>
      </td>
      <td>${esc(other ? other.name : 'Unknown')}</td>
      <td>${esc(b.moveIn)}<br><span style="font-size:12px;color:var(--muted)">${b.months} month${b.months > 1 ? 's' : ''}</span></td>
      <td>${l ? peso(l.price * b.months) : '—'}</td>
      <td><span class="status ${b.status}">${b.status}</span></td>
      <td>
        <div class="mini-actions">
          ${role === 'owner' && b.status === 'Pending' ? `
            <button class="btn btn-primary btn-sm" data-action="set-booking" data-id="${b.id}" data-status="Approved">Approve</button>
            <button class="btn btn-danger btn-sm" data-action="set-booking" data-id="${b.id}" data-status="Declined">Decline</button>` : ''}
          ${role === 'renter' && b.status === 'Pending' ? `
            <button class="btn btn-danger btn-sm" data-action="cancel-booking" data-id="${b.id}">Cancel</button>` : ''}
        </div>
      </td>
    </tr>`;
}

function viewMyBookings() {
  const myReqs = db.bookings.filter(b => b.renterId === session).sort((a, b) => b.createdAt - a.createdAt);
  const incoming = db.bookings.filter(b => b.ownerId === session).sort((a, b) => b.createdAt - a.createdAt);

  const table = (rows, role, emptyMsg) => rows.length ? `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Place</th><th>${role === 'owner' ? 'Renter' : 'Host'}</th><th>Move-in</th><th>Total</th><th>Status</th><th></th></tr></thead>
        <tbody>${rows.map(b => bookingRow(b, role)).join('')}</tbody>
      </table>
    </div>` : emptyState(emptyMsg);

  return `
  <div class="section-head" style="margin-top:26px">
    <div>
      <h2>My Bookings</h2>
      <p>Track your rental requests and manage the ones for your places.</p>
    </div>
  </div>

  <h3 style="font-size:19px;color:var(--brown);margin:0 0 14px;font-weight:800">Requests I sent</h3>
  ${table(myReqs, 'renter', 'You haven\'t requested a rental yet. Browse some places!')}

  <h3 style="font-size:19px;color:var(--brown);margin:32px 0 14px;font-weight:800">Requests for my places</h3>
  ${table(incoming, 'owner', 'No one has requested your listings yet.')}`;
}