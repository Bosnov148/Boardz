function openAuth(mode = 'login') {
  state.authMode = mode;
  renderAuthModal();
}

function renderAuthModal() {
  const mode = state.authMode;
  const isAdminMode = mode === 'admin';

  let formHTML = '';

  if (mode === 'login' || mode === 'register') {
    formHTML = `
      <div class="modal-tabs">
        <button class="${mode === 'login' ? 'active' : ''}" data-action="auth-tab" data-mode="login">Log in</button>
        <button class="${mode === 'register' ? 'active' : ''}" data-action="auth-tab" data-mode="register">Sign up</button>
      </div>
      <form data-form="${mode}">
        ${mode === 'register' ? `
          <div class="row">
            <label>Full name</label>
            <input class="field" name="name" required placeholder="Juan Dela Cruz">
          </div>` : ''}
        <div class="row">
          <label>Email</label>
          <input class="field" name="email" type="email" required placeholder="you@example.com">
        </div>
        <div class="row">
          <label>Password</label>
          <div class="pw-wrap">
            <input class="field" name="password" type="password" required minlength="5" placeholder="••••••••">
            <button type="button" class="pw-toggle" data-action="toggle-pw">Show</button>
          </div>
        </div>
        <button class="btn btn-primary btn-block">${mode === 'login' ? 'Log in to BOARDz' : 'Create my account'}</button>
      </form>
      <div class="demo-note">
        <b>Demo renter account</b><br>
        maria@boardz.ph · maria123
      </div>
      <p style="text-align:center;margin-top:18px;font-size:12.5px;color:var(--muted);font-weight:600">
        Are you the site manager?
        <a style="color:var(--terra);cursor:pointer;font-weight:700" data-action="auth-tab" data-mode="admin">Admin login →</a>
      </p>`;
  } else {
    formHTML = `
      <span class="admin-badge">Administrator access</span>
      <h2>Admin Login</h2>
      <p class="sub">Restricted area. Only BOARDz site managers may sign in here.</p>
      <form data-form="admin-login">
        <div class="row">
          <label>Admin email</label>
          <input class="field" name="email" type="email" required placeholder="admin@boardz.ph">
        </div>
        <div class="row">
          <label>Password</label>
          <div class="pw-wrap">
            <input class="field" name="password" type="password" required placeholder="••••••••">
            <button type="button" class="pw-toggle" data-action="toggle-pw">Show</button>
          </div>
        </div>
        <button class="btn btn-primary btn-block">Enter admin dashboard</button>
      </form>
      <div class="demo-note">
        <b>Demo admin credentials</b><br>
        admin@boardz.ph · admin123
      </div>
      <p style="text-align:center;margin-top:18px;font-size:12.5px;color:var(--muted);font-weight:600">
        <a style="color:var(--terra);cursor:pointer;font-weight:700" data-action="auth-tab" data-mode="login">← Back to normal login</a>
      </p>`;
  }

  const root = $('#modal-root');
  root.innerHTML = `
    <div class="modal ${isAdminMode ? 'admin-modal' : ''}">
      <div class="modal-inner">
        <button class="modal-close" data-action="close-modal">✕</button>
        ${isAdminMode ? formHTML : `
          <h2>${mode === 'login' ? 'Welcome back' : 'Join BOARDz'}</h2>
          <p class="sub">${mode === 'login' ? 'Log in to save places and request rentals.' : 'Create an account to list and rent homes in Davao.'}</p>
          ${formHTML}`}
      </div>
    </div>`;
  root.classList.add('open');
}

function closeModal() {
  const root = $('#modal-root');
  root.classList.remove('open');
  root.innerHTML = '';
}