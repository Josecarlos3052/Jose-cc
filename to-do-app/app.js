// ============================================================
// TaskFlow - app.js
// Persistence: localStorage simulates db.json with keys:
//   "users"       => array of user objects
//   "todos"       => array of todo objects
//   "currentUser" => object of logged-in user (or null)
// ============================================================

// ---------- Storage helpers ----------

function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function getTodos() {
  return JSON.parse(localStorage.getItem('todos') || '[]');
}

function saveTodos(todos) {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function getCurrentUser() {
  const raw = localStorage.getItem('currentUser');
  return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
}

// ---------- View switching ----------

function showAuth(view) {
  document.getElementById('app-container').classList.add('hidden');
  document.getElementById('auth-container').classList.remove('hidden');

  if (view === 'register') {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('register-view').classList.remove('hidden');
  } else {
    document.getElementById('register-view').classList.add('hidden');
    document.getElementById('login-view').classList.remove('hidden');
  }
  clearAuthErrors();
}

function showApp(user) {
  document.getElementById('auth-container').classList.add('hidden');
  document.getElementById('app-container').classList.remove('hidden');
  document.getElementById('user-name-display').textContent = user.name;
  renderTasks();
}

// ---------- Error helpers ----------

function clearAuthErrors() {
  const ids = [
    'login-general-error', 'login-email-error', 'login-password-error',
    'register-general-error', 'register-name-error', 'register-email-error', 'register-password-error'
  ];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.classList.add('hidden'); el.textContent = ''; }
  });

  const inputs = document.querySelectorAll('.field-input');
  inputs.forEach(i => i.classList.remove('error-state'));
}

function showFieldError(errorId, inputId, msg) {
  const errEl = document.getElementById(errorId);
  if (errEl) { errEl.textContent = msg; errEl.classList.remove('hidden'); }
  if (inputId) {
    const input = document.getElementById(inputId);
    if (input) input.classList.add('error-state');
  }
}

function showGeneralError(errorId, msg) {
  const el = document.getElementById(errorId);
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}

// ---------- Auth: Register ----------

function handleRegister(e) {
  e.preventDefault();
  clearAuthErrors();

  const name     = document.getElementById('register-name').value.trim();
  const email    = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;

  let valid = true;

  if (!name) {
    showFieldError('register-name-error', 'register-name', 'Nome obrigatorio');
    valid = false;
  }
  if (!email) {
    showFieldError('register-email-error', 'register-email', 'E-mail obrigatorio');
    valid = false;
  }
  if (!password || password.length < 6) {
    showFieldError('register-password-error', 'register-password', 'Senha obrigatoria (min. 6 caracteres)');
    valid = false;
  }

  if (!valid) return;

  const users = getUsers();
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

  if (exists) {
    showGeneralError('register-general-error', 'Este e-mail ja esta cadastrado.');
    showFieldError('register-email-error', 'register-email', 'E-mail ja cadastrado');
    return;
  }

  const newUser = {
    id: Date.now().toString(),
    name,
    email: email.toLowerCase(),
    password
  };

  users.push(newUser);
  saveUsers(users);

  showAuth('login');
}

// ---------- Auth: Login ----------

function handleLogin(e) {
  e.preventDefault();
  clearAuthErrors();

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  let valid = true;

  if (!email) {
    showFieldError('login-email-error', 'login-email', 'E-mail obrigatorio');
    valid = false;
  }
  if (!password) {
    showFieldError('login-password-error', 'login-password', 'Senha obrigatoria');
    valid = false;
  }

  if (!valid) return;

  const users = getUsers();
  const user  = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    showGeneralError('login-general-error', 'E-mail ou senha invalidos. Verifique e tente novamente.');
    return;
  }

  const sessionUser = { id: user.id, name: user.name, email: user.email };
  setCurrentUser(sessionUser);
  showApp(sessionUser);
}

// ---------- Auth: Logout ----------

function handleLogout() {
  setCurrentUser(null);
  showAuth('login');
  document.getElementById('login-form').reset();
}

// ---------- Tasks ----------

function getTypeLabel(type) {
  const labels = { work: 'Trabalho', personal: 'Pessoal', study: 'Estudos' };
  return labels[type] || type;
}

function getBadgeClass(type) {
  const map = { work: 'badge-work', personal: 'badge-personal', study: 'badge-study' };
  return map[type] || 'badge-work';
}

function handleAddTask(e) {
  e.preventDefault();

  const user  = getCurrentUser();
  if (!user) return;

  const titleEl = document.getElementById('task-title');
  const title   = titleEl.value.trim();
  const type    = document.getElementById('task-type').value;
  const desc    = document.getElementById('task-desc').value.trim();

  const errEl = document.getElementById('task-title-error');
  if (!title) {
    errEl.classList.remove('hidden');
    titleEl.classList.add('error-state');
    return;
  }
  errEl.classList.add('hidden');
  titleEl.classList.remove('error-state');

  const todos = getTodos();
  const newTodo = {
    id:          Date.now().toString(),
    userId:      user.email,
    title,
    type,
    description: desc,
    done:        false
  };

  todos.push(newTodo);
  saveTodos(todos);

  document.getElementById('task-form').reset();
  renderTasks();
}

function toggleDone(todoId) {
  const todos = getTodos();
  const idx   = todos.findIndex(t => t.id === todoId);
  if (idx === -1) return;

  todos[idx].done = true;
  saveTodos(todos);
  renderTasks();
}

function renderTasks() {
  const user = getCurrentUser();
  if (!user) return;

  const todos = getTodos();
  const mine  = todos.filter(t => t.email === user.email || t.userId === user.email);

  const pending   = mine.filter(t => !t.done);
  const completed = mine.filter(t => t.done);
  const sorted    = [...pending, ...completed];

  document.getElementById('stat-total').textContent   = mine.length;
  document.getElementById('stat-pending').textContent = pending.length;
  document.getElementById('stat-done').textContent    = completed.length;

  const listEl = document.getElementById('task-list');

  if (sorted.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">&#128203;</div>
        <p>Nenhuma tarefa cadastrada ainda.</p>
      </div>`;
    return;
  }

  listEl.innerHTML = sorted.map(todo => {
    const badgeClass = getBadgeClass(todo.type);
    const label      = getTypeLabel(todo.type);
    const doneClass  = todo.done ? 'done' : '';
    const btnClass   = todo.done ? 'is-done' : '';
    const btnText    = todo.done ? '&#10003; Concluida' : 'Concluir';
    const btnAttr    = todo.done ? 'disabled' : `onclick="toggleDone('${todo.id}')"`;
    const descHtml   = todo.description
      ? `<p class="task-desc">${escapeHtml(todo.description)}</p>`
      : '';

    return `
      <div class="task-card ${doneClass}" id="task-${todo.id}">
        <div class="task-content">
          <div class="task-header">
            <span class="task-title">${escapeHtml(todo.title)}</span>
            <span class="task-badge ${badgeClass}">${label}</span>
          </div>
          ${descHtml}
        </div>
        <button class="btn-complete ${btnClass}" ${btnAttr}>${btnText}</button>
      </div>`;
  }).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ---------- Bootstrap ----------

function boot() {
  const user = getCurrentUser();

  if (user) {
    showApp(user);
  } else {
    showAuth('login');
  }

  // Auth form listeners
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('register-form').addEventListener('submit', handleRegister);

  // View toggle
  document.getElementById('go-register').addEventListener('click', e => {
    e.preventDefault();
    showAuth('register');
  });
  document.getElementById('go-login').addEventListener('click', e => {
    e.preventDefault();
    showAuth('login');
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  // Task form
  document.getElementById('task-form').addEventListener('submit', handleAddTask);

  // Clear field error on type
  document.getElementById('task-title').addEventListener('input', () => {
    document.getElementById('task-title-error').classList.add('hidden');
    document.getElementById('task-title').classList.remove('error-state');
  });
}

document.addEventListener('DOMContentLoaded', boot);
