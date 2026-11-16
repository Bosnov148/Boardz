function render() {
  renderHeader();
  const app = $('#app');

  switch (state.view) {
    case 'home':         app.innerHTML = viewHome(); break;
    case 'detail':       app.innerHTML = viewDetail(); break;
    case 'listing-form': app.innerHTML = viewListingForm(); break;
    case 'my-listings':  app.innerHTML = viewMyListings(); break;
    case 'my-bookings':  app.innerHTML = viewMyBookings(); break;
    case 'favorites':    app.innerHTML = viewFavorites(); break;
    case 'messages':     app.innerHTML = viewMessages(); break;
    case 'conversation': app.innerHTML = viewConversation(); break;
    case 'admin':        app.innerHTML = viewAdmin(); break;
    default:             app.innerHTML = viewHome();
  }

  if (state.view === 'conversation') {
    requestAnimationFrame(() => {
      const t = document.querySelector('.conv-thread');
      if (t) t.scrollTop = t.scrollHeight;
    });
  }
}

function navigate(view) {
  const needsAuth = ['my-listings', 'my-bookings', 'favorites', 'messages'].includes(view);
  if (needsAuth && !session) { openAuth('login'); toast('Please log in first'); return; }
  if (view === 'admin' && !isAdmin()) { openAuth('admin'); toast('Admin access required'); return; }

  state.view = view;
  if (view !== 'listing-form') state.editId = null;
  if (view !== 'conversation') state.conv = null;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', e => {
  const chip = e.target.closest('[data-typechip]');
  if (chip) {
    state.filter.type = chip.dataset.typechip;
    document.querySelectorAll('[data-typechip]').forEach(b =>
      b.classList.toggle('active', b.dataset.typechip === state.filter.type));
    updateGrid();
    return;
  }

  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  const id = el.dataset.id;

  switch (action) {
    case 'noop': break;

    case 'nav': navigate(el.dataset.view); break;

    case 'open-listing':
      state.detailId = id;
      state.view = 'detail';
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      break;

    case 'fav': {
      e.stopPropagation();
      if (!session) { openAuth('login'); toast('Log in to save places'); return; }
      const arr = db.favorites[session] || (db.favorites[session] = []);
      const i = arr.indexOf(id);
      if (i > -1) { arr.splice(i, 1); toast('Removed from saved places'); }
      else { arr.push(id); toast('Saved to your favorites'); }
      persist();
      render();
      break;
    }

    case 'open-auth': openAuth(el.dataset.mode || 'login'); break;
    case 'open-admin': openAuth('admin'); break;
    case 'auth-tab': state.authMode = el.dataset.mode; renderAuthModal(); break;
    case 'close-modal': closeModal(); break;

    case 'toggle-pw': {
      const wrap = el.closest('.pw-wrap');
      const input = wrap.querySelector('input');
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      el.textContent = show ? 'Hide' : 'Show';
      el.classList.toggle('on', show);
      break;
    }

    case 'remove-upload': {
      const form = el.closest('form');
      form.querySelector('[name=imageData]').value = '';
      form.querySelector('#upload-preview').innerHTML = '';
      const first = form.querySelector('[name=cover][value="0"]');
      if (first) first.checked = true;
      break;
    }

    case 'open-conversation': {
      if (!session) { openAuth('login'); toast('Log in to message hosts'); return; }
      const listingId = el.dataset.listing;
      const otherId = el.dataset.to;
      state.conv = { listingId, otherId };
      state.view = 'conversation';
      let changed = false;
      db.messages.forEach(m => {
        if (m.listingId === listingId && m.fromId === otherId && m.toId === session && !m.read) {
          m.read = true; changed = true;
        }
      });
      if (changed) persist();
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      break;
    }

    case 'logout':
      session = null;
      localStorage.removeItem(SESSION_KEY);
      state.view = 'home';
      state.conv = null;
      render();
      toast('You have been logged out');
      break;

    case 'new-listing':
      if (!session) { openAuth('login'); return; }
      state.editId = null;
      state.view = 'listing-form';
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      break;

    case 'edit-listing': {
      const l = db.listings.find(x => x.id === id);
      if (!l) return;
      const user = me();
      if (!user || (user.role !== 'admin' && l.ownerId !== user.id)) {
        toast('You can only edit your own listings');
        return;
      }
      state.editId = id;
      state.view = 'listing-form';
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      break;
    }

    case 'delete-listing': {
      const l = db.listings.find(x => x.id === id);
      if (!l) return;
      const user = me();
      if (!user || (user.role !== 'admin' && l.ownerId !== user.id)) {
        toast('You can only remove your own listings');
        return;
      }
      if (!confirm(`Remove "${l.title}" from BOARDz? This cannot be undone.`)) return;
      db.listings = db.listings.filter(x => x.id !== id);
      db.bookings = db.bookings.filter(b => b.listingId !== id);
      db.messages = db.messages.filter(m => m.listingId !== id);
      Object.keys(db.favorites).forEach(k => {
        db.favorites[k] = db.favorites[k].filter(f => f !== id);
      });
      persist();
      if (state.view === 'detail') state.view = 'home';
      render();
      toast('Listing removed');
      break;
    }

    case 'set-booking': {
      const b = db.bookings.find(x => x.id === id);
      if (!b) return;
      const user = me();
      if (!user || (user.role !== 'admin' && b.ownerId !== user.id)) {
        toast('Not allowed');
        return;
      }
      b.status = el.dataset.status;
      persist();
      render();
      toast(`Request ${b.status.toLowerCase()}`);
      break;
    }

    case 'cancel-booking': {
      const b = db.bookings.find(x => x.id === id);
      if (!b || b.renterId !== session) return;
      db.bookings = db.bookings.filter(x => x.id !== id);
      persist();
      render();
      toast('Request cancelled');
      break;
    }

    case 'admin-tab':
      state.adminTab = el.dataset.tab;
      render();
      break;

    case 'admin-delete-user': {
      if (!isAdmin()) return;
      const u = db.users.find(x => x.id === id);
      if (!u) return;
      if (!confirm(`Delete user "${u.name}"? Their listings will also be removed.`)) return;
      db.users = db.users.filter(x => x.id !== id);
      db.listings = db.listings.filter(l => l.ownerId !== id);
      db.bookings = db.bookings.filter(b => b.renterId !== id && b.ownerId !== id);
      db.messages = db.messages.filter(m => m.fromId !== id && m.toId !== id);
      delete db.favorites[id];
      persist();
      render();
      toast('User deleted');
      break;
    }

    case 'admin-delete-booking': {
      if (!isAdmin()) return;
      db.bookings = db.bookings.filter(b => b.id !== id);
      persist();
      render();
      toast('Booking deleted');
      break;
    }
  }
});

document.addEventListener('change', async e => {
  const t = e.target;

  if (t.id === 'cover-upload') {
    const file = t.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast('Please pick an image under 5 MB'); t.value = ''; return; }
    try {
      const data = await compressImage(file);
      const form = t.closest('form');
      form.querySelector('[name=imageData]').value = data;
      form.querySelector('#upload-preview').innerHTML =
        `<img src="${data}" alt="Cover preview"><button type="button" class="upload-remove" data-action="remove-upload">×</button>`;
      form.querySelectorAll('[name=cover]').forEach(r => r.checked = false);
      toast('Photo attached');
    } catch (err) {
      toast('Could not read that image');
    }
    t.value = '';
    return;
  }

  if (t.name === 'cover') {
    const form = t.closest('form');
    if (form) {
      form.querySelector('[name=imageData]').value = '';
      const prev = form.querySelector('#upload-preview');
      if (prev) prev.innerHTML = '';
    }
    return;
  }

  if (t.id === 'barangayFilter') { state.filter.barangay = t.value; updateGrid(); }
  if (t.id === 'sortFilter')     { state.filter.sort = t.value;     updateGrid(); }

  if (t.dataset && t.dataset.action === 'admin-status') {
    if (!isAdmin()) return;
    const b = db.bookings.find(x => x.id === t.dataset.id);
    if (!b) return;
    b.status = t.value;
    persist();
    toast('Status updated to ' + t.value);
  }
});

document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'searchInput') { state.filter.q = t.value; updateGrid(); }
  if (t.id === 'priceRange') {
    state.filter.maxPrice = Number(t.value);
    const lbl = $('#priceLabel');
    if (lbl) lbl.textContent = peso(t.value);
    updateGrid();
  }
});

document.addEventListener('submit', e => {
  const form = e.target.closest('form[data-form]');
  if (!form) return;
  e.preventDefault();

  const type = form.dataset.form;
  const fd = new FormData(form);

  if (type === 'login') {
    const email = String(fd.get('email') || '').trim().toLowerCase();
    const pass = String(fd.get('password') || '');
    const user = db.users.find(u => u.email.toLowerCase() === email && u.password === pass);
    if (!user) { toast('Incorrect email or password'); return; }
    session = user.id;
    localStorage.setItem(SESSION_KEY, session);
    closeModal();
    render();
    toast(`Welcome back, ${user.name.split(' ')[0]}!`);
    return;
  }

  if (type === 'register') {
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim().toLowerCase();
    const pass = String(fd.get('password') || '');
    if (db.users.some(u => u.email.toLowerCase() === email)) {
      toast('That email is already registered');
      return;
    }
    const user = { id: uid('u'), name, email, password: pass, role: 'user' };
    db.users.push(user);
    persist();
    session = user.id;
    localStorage.setItem(SESSION_KEY, session);
    closeModal();
    render();
    toast(`Welcome to BOARDz, ${name.split(' ')[0]}!`);
    return;
  }

  if (type === 'admin-login') {
    const email = String(fd.get('email') || '').trim().toLowerCase();
    const pass = String(fd.get('password') || '');
    const user = db.users.find(u => u.email.toLowerCase() === email && u.password === pass && u.role === 'admin');
    if (!user) { toast('Invalid admin credentials'); return; }
    session = user.id;
    localStorage.setItem(SESSION_KEY, session);
    closeModal();
    state.view = 'admin';
    state.adminTab = 'overview';
    render();
    toast('Admin session started');
    return;
  }

  if (type === 'listing') {
    const user = me();
    if (!user) { toast('Please log in'); return; }

    const editingId = form.dataset.id || '';
    const amenities = fd.getAll('amenities').map(String);
    const cover = Number(fd.get('cover') || 0);
    const imageData = String(fd.get('imageData') || '');

    const payload = {
      title: String(fd.get('title') || '').trim(),
      type: String(fd.get('type') || 'Bedspace'),
      price: Number(fd.get('price') || 0),
      street: String(fd.get('street') || '').trim(),
      barangay: String(fd.get('barangay') || 'Poblacion'),
      description: String(fd.get('description') || '').trim(),
      amenities,
      cover,
      image: imageData || ''
    };

    if (editingId) {
      const l = db.listings.find(x => x.id === editingId);
      if (!l) return;
      if (user.role !== 'admin' && l.ownerId !== user.id) { toast('Not allowed'); return; }
      Object.assign(l, payload);
      persist();
      state.view = 'my-listings';
      state.editId = null;
      render();
      toast('Listing updated');
    } else {
      const listing = Object.assign({
        id: uid('l'),
        ownerId: user.id,
        createdAt: Date.now(),
        rating: 4.5,
        reviews: []
      }, payload);
      db.listings.push(listing);
      persist();
      state.view = user.role === 'admin' ? 'admin' : 'my-listings';
      if (user.role === 'admin') state.adminTab = 'listings';
      render();
      toast('Your listing is live!');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (type === 'booking') {
    const user = me();
    if (!user) { openAuth('login'); return; }
    const listingId = form.dataset.id;
    const l = db.listings.find(x => x.id === listingId);
    if (!l) return;

    db.bookings.push({
      id: uid('b'),
      listingId,
      renterId: user.id,
      ownerId: l.ownerId,
      moveIn: String(fd.get('moveIn') || todayISO()),
      months: Number(fd.get('months') || 1),
      message: String(fd.get('message') || '').trim(),
      status: 'Pending',
      createdAt: Date.now()
    });
    persist();
    render();
    toast('Rental request sent to the host');
    return;
  }

  if (type === 'message') {
    const user = me();
    if (!user) return;
    const text = String(fd.get('text') || '').trim();
    if (!text) return;
    const listingId = form.dataset.listing;
    const toId = form.dataset.to;
    if (!listingId || !toId) return;

    db.messages.push({
      id: uid('msg'),
      listingId,
      fromId: user.id,
      toId,
      text,
      createdAt: Date.now(),
      read: false
    });
    persist();
    render();
    return;
  }
});

$('#modal-root').addEventListener('click', e => {
  if (e.target.id === 'modal-root') closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

load();
render();