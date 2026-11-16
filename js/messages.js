function convCardHTML(c) {
  const l = db.listings.find(x => x.id === c.listingId);
  const other = db.users.find(u => u.id === c.otherId);
  const img = l ? (l.image || COVER_IMAGES[l.cover % COVER_IMAGES.length]) : '';
  const mine = c.last.fromId === session;
  const preview = (mine ? 'You: ' : '') + c.last.text;
  const short = preview.length > 70 ? preview.slice(0, 70) + '…' : preview;
  return `
  <div class="conv-card" data-action="open-conversation" data-listing="${c.listingId}" data-to="${c.otherId}">
    <div class="conv-card-cover" style="background-image:url('${img}')"></div>
    <div class="conv-card-body">
      <div class="conv-card-top">
        <strong>${esc(other ? other.name : 'Unknown')}</strong>
        <span class="conv-time">${formatTime(c.last.createdAt)}</span>
      </div>
      <div class="conv-card-listing">${esc(l ? l.title : '(deleted listing)')}</div>
      <div class="conv-card-preview ${c.unread ? 'unread' : ''}">${esc(short)}</div>
    </div>
    ${c.unread ? `<span class="conv-unread">${c.unread}</span>` : ''}
  </div>`;
}

function viewMessages() {
  const convs = myConversations();
  return `
  <div class="section-head" style="margin-top:26px">
    <div>
      <h2>Messages</h2>
      <p>Your conversations with hosts and renters across Davao City.</p>
    </div>
    <span class="count-pill">${convs.length} conversation${convs.length === 1 ? '' : 's'}</span>
  </div>
  ${convs.length ? `<div class="conv-list">${convs.map(convCardHTML).join('')}</div>` : emptyState('No conversations yet. Message a host from any listing to start one.')}`;
}

function viewConversation() {
  if (!state.conv) { state.view = 'messages'; return viewMessages(); }
  const { listingId, otherId } = state.conv;
  const l = db.listings.find(x => x.id === listingId);
  const other = db.users.find(u => u.id === otherId);
  if (!l || !other) { state.view = 'messages'; return emptyState('Conversation unavailable.'); }

  let changed = false;
  db.messages.forEach(m => {
    if (m.listingId === listingId && m.fromId === otherId && m.toId === session && !m.read) {
      m.read = true; changed = true;
    }
  });
  if (changed) persist();

  const thread = getThread(listingId, otherId);
  const img = l.image || COVER_IMAGES[l.cover % COVER_IMAGES.length];

  const bubbles = thread.map(m => {
    const mine = m.fromId === session;
    return `<div class="bubble-row ${mine ? 'me' : 'them'}">
      <div class="bubble">${esc(m.text)}</div>
      <div class="bubble-time">${formatTime(m.createdAt)}</div>
    </div>`;
  }).join('');

  return `
  <a class="back-link" data-action="nav" data-view="messages">← All messages</a>
  <div class="conv-head">
    <div class="conv-cover" style="background-image:url('${img}')"></div>
    <div class="conv-meta">
      <div class="conv-with">Conversation with <strong>${esc(other.name)}</strong></div>
      <div class="conv-listing"><a data-action="open-listing" data-id="${l.id}">${esc(l.title)}</a></div>
      <div class="conv-loc">${esc(l.street)}, ${esc(l.barangay)}</div>
    </div>
  </div>
  <div class="conv-thread">
    ${thread.length ? bubbles : '<div class="conv-empty">No messages yet — say hello to get things started.</div>'}
  </div>
  <form class="conv-form" data-form="message" data-listing="${listingId}" data-to="${otherId}">
    <textarea name="text" rows="1" placeholder="Write a message…" required></textarea>
    <button class="btn btn-primary">Send</button>
  </form>`;
}