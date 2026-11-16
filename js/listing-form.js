function viewListingForm() {
  const editing = state.editId ? db.listings.find(l => l.id === state.editId) : null;
  if (state.editId && !editing) return emptyState('Listing not found.');

  const l = editing || {
    title: '', type: 'Bedspace', price: '', street: '', barangay: 'Poblacion',
    description: '', amenities: [], cover: 0, image: ''
  };

  return `
  <a class="back-link" data-action="nav" data-view="${editing ? 'my-listings' : 'home'}">← Cancel</a>
  <div class="editor">
    <div class="section-head">
      <div>
        <h2>${editing ? 'Edit your listing' : 'List a place on BOARDz'}</h2>
        <p>${editing ? 'Update the details of your rental.' : 'Tell renters about your cozy corner in Davao City.'}</p>
      </div>
    </div>

    <form class="panel" data-form="listing" data-id="${editing ? editing.id : ''}">
      <input type="hidden" name="imageData" value="${esc(l.image || '')}">
      <div class="form-grid">
        <div class="full">
          <label>Listing title</label>
          <input class="field" name="title" required maxlength="70" value="${esc(l.title)}" placeholder="e.g. Sunny Bedspace near USEP">
        </div>

        <div>
          <label>Type</label>
          <select class="field" name="type">
            ${TYPES.map(t => `<option ${l.type === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>

        <div>
          <label>Monthly rent (₱)</label>
          <input class="field" name="price" type="number" min="500" max="100000" step="100" required value="${esc(l.price)}" placeholder="2500">
        </div>

        <div>
          <label>Street</label>
          <input class="field" name="street" list="streetList" required value="${esc(l.street)}" placeholder="e.g. Roxas Avenue">
          <datalist id="streetList">${STREETS.map(s => `<option value="${esc(s)}">`).join('')}</datalist>
        </div>

        <div>
          <label>Barangay</label>
          <select class="field" name="barangay">
            ${BARANGAYS.map(b => `<option ${l.barangay === b ? 'selected' : ''}>${esc(b)}</option>`).join('')}
          </select>
        </div>

        <div class="full">
          <label>Description</label>
          <textarea class="field" name="description" rows="4" required maxlength="800" placeholder="Describe the space, the neighborhood, and what makes it cozy…">${esc(l.description)}</textarea>
        </div>

        <div class="full">
          <label>Cover photo</label>
          <div class="upload-row">
            <label class="upload-zone" for="cover-upload">
              <input type="file" id="cover-upload" accept="image/*">
              <span class="upload-icon">+</span>
              <span class="upload-text">
                <strong>Upload a photo of the room</strong>
                <small>JPG or PNG, up to 5 MB</small>
              </span>
            </label>
            <div class="upload-preview" id="upload-preview">
              ${l.image ? `<img src="${l.image}" alt="Cover preview"><button type="button" class="upload-remove" data-action="remove-upload">×</button>` : ''}
            </div>
          </div>
          <p class="upload-hint">Or choose a preset cover</p>
          <div class="cover-picker">
            ${COVER_IMAGES.map((img, i) => `
              <label class="cover-opt" style="background-image:url('${img}');background-size:cover;background-position:center" title="Cover ${i + 1}">
                <input type="radio" name="cover" value="${i}" ${!l.image && l.cover === i ? 'checked' : ''}>
              </label>`).join('')}
          </div>
        </div>

        <div class="full">
          <label>Amenities</label>
          <div class="amenity-picker">
            ${AMENITIES.map(a => `
              <label class="amenity-pick">
                <input type="checkbox" name="amenities" value="${esc(a)}" ${l.amenities.includes(a) ? 'checked' : ''}>
                ${esc(a)}
              </label>`).join('')}
          </div>
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap">
        <button class="btn btn-primary">${editing ? 'Save changes' : 'Publish listing'}</button>
        <button type="button" class="btn btn-ghost" data-action="nav" data-view="${editing ? 'my-listings' : 'home'}">Cancel</button>
      </div>
    </form>
  </div>`;
}