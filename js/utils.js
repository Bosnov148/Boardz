const $  = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const peso = n => '₱' + Number(n).toLocaleString('en-PH');
const uid = p => p + '_' + Math.random().toString(36).slice(2, 9);
const todayISO = () => new Date().toISOString().slice(0, 10);
const me = () => db.users.find(u => u.id === session) || null;
const isAdmin = () => { const u = me(); return !!u && u.role === 'admin'; };
const isFav = id => !!(session && (db.favorites[session] || []).includes(id));
const emptyState = msg => `<div class="empty"><span>—</span><p>${esc(msg)}</p></div>`;

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  $('#toast-root').appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 320); }, 2600);
}

function formatTime(ts) {
  const diff = (Date.now() - ts) / 60000;
  if (diff < 1) return 'Just now';
  if (diff < 60) return Math.floor(diff) + 'm ago';
  if (diff < 1440) return Math.floor(diff / 60) + 'h ago';
  const d = new Date(ts);
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

function compressImage(file, maxW = 900, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function conversationKey(listingId, aId, bId) {
  return listingId + '::' + [aId, bId].sort().join('::');
}

function getThread(listingId, otherId) {
  return db.messages.filter(m =>
    m.listingId === listingId &&
    ((m.fromId === session && m.toId === otherId) || (m.fromId === otherId && m.toId === session))
  ).sort((a, b) => a.createdAt - b.createdAt);
}

function myConversations() {
  if (!session) return [];
  const map = new Map();
  db.messages.forEach(m => {
    const other = m.fromId === session ? m.toId : (m.toId === session ? m.fromId : null);
    if (!other) return;
    const key = conversationKey(m.listingId, session, other);
    const cur = map.get(key);
    const unread = cur ? cur.unread : 0;
    const addUnread = (m.toId === session && !m.read) ? 1 : 0;
    if (!cur || m.createdAt > cur.last.createdAt) {
      map.set(key, { listingId: m.listingId, otherId: other, last: m, unread: unread + addUnread });
    } else {
      cur.unread = unread + addUnread;
    }
  });
  return [...map.values()].sort((a, b) => b.last.createdAt - a.last.createdAt);
}

function hasThreadWith(listingId, otherId) {
  if (!session) return false;
  return db.messages.some(m =>
    m.listingId === listingId &&
    ((m.fromId === session && m.toId === otherId) || (m.fromId === otherId && m.toId === session))
  );
}

function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); }

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    db = raw ? JSON.parse(raw) : seed();
  } catch (e) { db = seed(); }
  if (!db.favorites) db.favorites = {};
  if (!db.messages)  db.messages  = [];
  persist();
  session = localStorage.getItem(SESSION_KEY) || null;
  if (session && !db.users.some(u => u.id === session)) session = null;
  if (!session) localStorage.removeItem(SESSION_KEY);
}