function renderHeader() {
  const user = me();
  const unread = session ? db.messages.filter(m => m.toId === session && !m.read).length : 0;
  const navItems = [
    ['home', 'Browse'],
    ['favorites', 'Saved'],
    ['my-listings', 'My Listings'],
    ['my-bookings', 'Bookings'],
    ['messages', unread ? `Messages <span class="nav-badge">${unread}</span>` : 'Messages']
  ];
  if (isAdmin()) navItems.push(['admin', 'Admin']);

  $('#header').innerHTML = `
    <div class="header-inner">
      <a class="logo" data-action="nav" data-view="home" style="font-size:26px;font-weight:800;font-family:'Playfair Display',serif;color:var(--ink);margin-right:10px;">BOARDz</a>
      <nav class="main">
        ${navItems.map(([v, label]) =>
          `<a data-action="nav" data-view="${v}" class="${state.view === v ? 'active' : ''}">${label}</a>`
        ).join('')}
      </nav>
      <div class="header-auth">
        ${user ? `
          <div class="user-chip">
            <span class="avatar">${esc(user.name.charAt(0).toUpperCase())}</span>
            ${esc(user.name.split(' ')[0])}
            ${user.role === 'admin' ? '<span class="role-tag">Admin</span>' : ''}
          </div>
          <button class="btn btn-ghost btn-sm" data-action="logout">Log out</button>
        ` : `
          <button class="btn btn-ghost btn-sm" data-action="open-auth" data-mode="login">Log in</button>
          <button class="btn btn-primary btn-sm" data-action="open-auth" data-mode="register">Sign up</button>
        `}
      </div>
    </div>`;
}