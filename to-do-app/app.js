// TaskFlow - app.js
// localStorage keys: "users" | "todos" | "currentUser"

// ---- Storage ----
const DB = {
  users:   () => JSON.parse(localStorage.getItem('users')  || '[]'),
  todos:   () => JSON.parse(localStorage.getItem('todos')  || '[]'),
  current: () => { const r = localStorage.getItem('currentUser'); return r ? JSON.parse(r) : null; },
  saveUsers:   (d) => localStorage.setItem('users',  JSON.stringify(d)),
  saveTodos:   (d) => localStorage.setItem('todos',  JSON.stringify(d)),
  saveCurrent: (d) => d ? localStorage.setItem('currentUser', JSON.stringify(d)) : localStorage.removeItem('currentUser'),
};

// ---- State ----
let activeFilter = 'all';

// ---- Utils ----
function esc(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

function initials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function typeClass(type) {
  return { work: 'type-work', personal: 'type-personal', study: 'type-study' }[type] || 'type-work';
}

function badgeClass(type) {
  return { work: 'bw', personal: 'bp', study: 'bs' }[type] || 'bw';
}

function typeLabel(type) {
  return { work: 'Trabalho', personal: 'Pessoal', study: 'Estudos' }[type] || type;
}

// ---- Error helpers ----
function clearErrors() {
  document.querySelectorAll('.ferror').forEach(e => e.classList.add('hidden'));
  document.querySelectorAll('.gen-error').forEach(e => { e.classList.add('hidden'); e.textContent = ''; });
  document.querySelectorAll('.finput').forEach(e => e.classList.remove('err'));
}

function fieldErr(errId, inputId, msg) {
  const e = document.getElementById(errId);
  if (e) { e.textContent = msg; e.classList.remove('hidden'); }
  const i = inputId && document.getElementById(inputId);
  if (i) i.classList.add('err');
}

function genErr(errId, msg) {
  const e = document.getElementById(errId);
  if (e) { e.textContent = msg; e.classList.remove('hidden'); }
}

// ---- Auth: switch views ----
function showAuth(view = 'login') {
  document.getElementById('app-container').classList.add('hidden');
  document.getElementById('auth-container').classList.remove('hidden');
  document.getElementById('login-view').classList.toggle('hidden', view !== 'login');
  document.getElementById('register-view').classList.toggle('hidden', view !== 'register');
  clearErrors();
}

function showApp(user) {
  document.getElementById('auth-container').classList.add('hidden');
  document.getElementById('app-container').classList.remove('hidden');
  document.getElementById('user-display').textContent = user.name;
  document.getElementById('user-avatar').textContent  = initials(user.name);
  renderTasks();
}

// ---- Register ----
function handleRegister(e) {
  e.preventDefault();
  clearErrors();
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const pass  = document.getElementById('reg-pass').value;
  let ok = true;

  if (!name)        { fieldErr('reg-name-err',  'reg-name',  'Nome obrigatorio');              ok = false; }
  if (!email)       { fieldErr('reg-email-err', 'reg-email', 'E-mail obrigatorio');             ok = false; }
  if (pass.length < 6) { fieldErr('reg-pass-err', 'reg-pass', 'Minimo 6 caracteres');          ok = false; }
  if (!ok) return;

  const users = DB.users();
  if (users.some(u => u.email === email)) {
    genErr('reg-gen-err', 'Este e-mail ja esta cadastrado.');
    fieldErr('reg-email-err', 'reg-email', 'E-mail ja cadastrado');
    return;
  }

  users.push({ id: Date.now().toString(), name, email, password: pass });
  DB.saveUsers(users);
  showAuth('login');
}

// ---- Login ----
function handleLogin(e) {
  e.preventDefault();
  clearErrors();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass  = document.getElementById('login-pass').value;
  let ok = true;

  if (!email) { fieldErr('login-email-err', 'login-email', 'Campo obrigatorio'); ok = false; }
  if (!pass)  { fieldErr('login-pass-err',  'login-pass',  'Campo obrigatorio'); ok = false; }
  if (!ok) return;

  const user = DB.users().find(u => u.email === email && u.password === pass);
  if (!user) {
    genErr('login-gen-err', 'E-mail ou senha invalidos. Tente novamente.');
    return;
  }

  const session = { id: user.id, name: user.name, email: user.email };
  DB.saveCurrent(session);
  showApp(session);
}

// ---- Logout ----
function handleLogout() {
  DB.saveCurrent(null);
  document.getElementById('login-form').reset();
  showAuth('login');
}

// ---- Add task ----
function handleAddTask(e) {
  e.preventDefault();
  const user = DB.current();
  if (!user) return;

  const titleEl = document.getElementById('task-title');
  const title   = titleEl.value.trim();
  const type    = document.getElementById('task-type').value;
  const desc    = document.getElementById('task-desc').value.trim();

  if (!title) {
    fieldErr('task-title-err', 'task-title', 'Titulo obrigatorio');
    titleEl.focus();
    return;
  }
  document.getElementById('task-title-err').classList.add('hidden');
  titleEl.classList.remove('err');

  const todos = DB.todos();
  todos.push({ id: Date.now().toString(), userId: user.email, title, type, description: desc, done: false });
  DB.saveTodos(todos);
  document.getElementById('task-form').reset();
  renderTasks();
}

// ---- Toggle done ----
function toggleDone(id) {
  const todos = DB.todos();
  const t = todos.find(x => x.id === id);
  if (!t || t.done) return;
  t.done = true;
  DB.saveTodos(todos);
  renderTasks();
}

// ---- Delete task ----
function deleteTask(id) {
  const card = document.getElementById('card-' + id);
  if (card) {
    card.style.transition = 'opacity .25s,transform .25s';
    card.style.opacity = '0';
    card.style.transform = 'translateX(16px)';
    setTimeout(() => {
      DB.saveTodos(DB.todos().filter(t => t.id !== id));
      renderTasks();
    }, 260);
  }
}

// ---- Render tasks ----
function renderTasks() {
  const user = DB.current();
  if (!user) return;

  const all      = DB.todos().filter(t => t.userId === user.email);
  const pending  = all.filter(t => !t.done);
  const done     = all.filter(t => t.done);

  // stats
  document.getElementById('stat-total').textContent   = all.length;
  document.getElementById('stat-pending').textContent = pending.length;
  document.getElementById('stat-done').textContent    = done.length;

  // progress
  const pct = all.length ? Math.round((done.length / all.length) * 100) : 0;
  document.getElementById('progress-pct').textContent = pct + '%';
  document.getElementById('progress-bar').style.width = pct + '%';

  // filter
  let list;
  if (activeFilter === 'pending') list = pending;
  else if (activeFilter === 'done') list = done;
  else list = [...pending, ...done];

  const listEl = document.getElementById('task-list');

  if (list.length === 0) {
    const msgs = {
      all:     'Nenhuma tarefa cadastrada ainda.',
      pending: 'Nenhuma tarefa pendente.',
      done:    'Nenhuma tarefa concluida ainda.',
    };
    listEl.innerHTML = `<div class="empty-state"><div class="empty-icon">&#128203;</div><p>${msgs[activeFilter]}</p></div>`;
    return;
  }

  listEl.innerHTML = list.map((todo, i) => {
    const bc  = badgeClass(todo.type);
    const tc  = typeClass(todo.type);
    const dn  = todo.done ? 'done' : '';
    const chk = todo.done ? 'checked' : '';
    const cl  = todo.done ? '' : `onclick="toggleDone('${todo.id}')"`;
    const desc = todo.description ? `<p class="task-desc">${esc(todo.description)}</p>` : '';
    return `
      <div class="task-card ${tc} ${dn}" id="card-${todo.id}" style="animation-delay:${i * 40}ms">
        <div class="task-check ${chk}" ${cl} title="${todo.done ? 'Concluida' : 'Marcar como concluida'}"></div>
        <div class="task-body">
          <div class="task-top">
            <span class="task-title">${esc(todo.title)}</span>
            <span class="task-badge ${bc}">${typeLabel(todo.type)}</span>
          </div>
          ${desc}
        </div>
        <div class="task-actions">
          <button class="btn-delete" onclick="deleteTask('${todo.id}')" title="Excluir tarefa">&#10005;</button>
        </div>
      </div>`;
  }).join('');
}

// ---- Filters ----
function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTasks();
    });
  });
}

// ---- Boot ----
function boot() {
  const user = DB.current();
  if (user) showApp(user);
  else showAuth('login');

  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('register-form').addEventListener('submit', handleRegister);
  document.getElementById('go-register').addEventListener('click', e => { e.preventDefault(); showAuth('register'); });
  document.getElementById('go-login').addEventListener('click', e => { e.preventDefault(); showAuth('login'); });
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('task-form').addEventListener('submit', handleAddTask);
  document.getElementById('task-title').addEventListener('input', () => {
    document.getElementById('task-title-err').classList.add('hidden');
    document.getElementById('task-title').classList.remove('err');
  });
  setupFilters();
}

document.addEventListener('DOMContentLoaded', boot);
