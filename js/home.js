function cardHTML(l) {
  const img = l.image || COVER_IMAGES[l.cover % COVER_IMAGES.length];
  const fav = isFav(l.id);
  return `
    <article class="card" data-action="open-listing" data-id="${l.id}">
      <div class="card-cover" style="background-image:url('${img}')">
        <span class="badge">${esc(l.type)}</span>
        <button class="heart ${fav ? 'on' : ''}" data-action="fav" data-id="${l.id}" title="Save to favorites">
          ${fav ? 'Saved' : 'Save'}
        </button>
      </div>
      <div class="card-body">
        <h3>${esc(l.title)}</h3>
        <p class="loc">${esc(l.street)}, ${esc(l.barangay)}</p>
        <div class="card-foot">
          <span class="price">${peso(l.price)}<small> /mo</small></span>
          <span class="rating">★ ${Number(l.rating).toFixed(1)}</span>
        </div>
      </div>
    </article>`;
}

function filteredListings() {
  const f = state.filter;
  let list = db.listings.slice();
  if (f.q) {
    const q = f.q.toLowerCase();
    list = list.filter(l =>
      (l.title + ' ' + l.street + ' ' + l.barangay + ' ' + l.type).toLowerCase().includes(q)
    );
  }
  if (f.type !== 'all') list = list.filter(l => l.type === f.type);
  if (f.barangay !== 'all') list = list.filter(l => l.barangay === f.barangay);
  list = list.filter(l => l.price <= f.maxPrice);

  if (f.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (f.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  else if (f.sort === 'rating') list.sort((a, b) => b.rating - a.rating);
  else list.sort((a, b) => b.createdAt - a.createdAt);

  return list;
}

function gridHTML() {
  const list = filteredListings();
  return list.length ? list.map(cardHTML).join('') : emptyState('No places match your search just yet. Try widening your filters.');
}

function viewHome() {
  const list = filteredListings();
  return `
  <section class="hero">
    <div class="hero-inner">
      <span class="hero-eyebrow">Davao City · Local Home Rentals</span>
      <h1>Find your <em>cozy</em> corner in Davao.</h1>
      <p>Bedspaces, rooms, studios and apartments — from Roxas Avenue to Matina. Rented out by real Dabawenyos, for real Dabawenyos.</p>
      <div class="hero-search">
        <input id="searchInput" placeholder="Search a street, barangay, or listing…" value="${esc(state.filter.q)}">
        <button class="btn btn-primary" data-action="noop">Search</button>
      </div>
    </div>
  </section>

  <div class="filters">
    <div class="chips">
      <button class="chip ${state.filter.type === 'all' ? 'active' : ''}" data-typechip="all">All</button>
      ${TYPES.map(t => `<button class="chip ${state.filter.type === t ? 'active' : ''}" data-typechip="${esc(t)}">${esc(t)}</button>`).join('')}
    </div>
    <div class="filter-right">
      <select class="field" id="barangayFilter">
        <option value="all">All barangays</option>
        ${BARANGAYS.map(b => `<option value="${esc(b)}" ${state.filter.barangay === b ? 'selected' : ''}>${esc(b)}</option>`).join('')}
      </select>
      <select class="field" id="sortFilter">
        <option value="newest"     ${state.filter.sort === 'newest' ? 'selected' : ''}>Newest first</option>
        <option value="price-asc"  ${state.filter.sort === 'price-asc' ? 'selected' : ''}>Price: low → high</option>
        <option value="price-desc" ${state.filter.sort === 'price-desc' ? 'selected' : ''}>Price: high → low</option>
        <option value="rating"     ${state.filter.sort === 'rating' ? 'selected' : ''}>Top rated</option>
      </select>
      <div class="price-wrap">
        <span>Max</span>
        <input type="range" id="priceRange" min="1000" max="${MAX_PRICE}" step="500" value="${state.filter.maxPrice}">
        <span id="priceLabel">${peso(state.filter.maxPrice)}</span>
      </div>
    </div>
  </div>

  <div class="section-head">
    <div>
      <h2>Places around Davao</h2>
      <p>Handpicked homes from local hosts across the city.</p>
    </div>
    <span class="count-pill" id="resultCount">${list.length} place${list.length === 1 ? '' : 's'} found</span>
  </div>

  <section class="grid" id="grid">${gridHTML()}</section>`;
}

function updateGrid() {
  const grid = $('#grid');
  if (!grid) return;
  const list = filteredListings();
  grid.innerHTML = gridHTML();
  const rc = $('#resultCount');
  if (rc) rc.textContent = `${list.length} place${list.length === 1 ? '' : 's'} found`;
}