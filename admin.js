// ============================================================
// CONFIG
// Login is now handled by Firebase Authentication (real backend).
// Create the admin's login in Firebase Console → Authentication →
// Sign-in method → enable "Email/Password" → Users → Add user.
// ============================================================
const auth = firebase.auth();

// ============================================================
// ELEMENTS
// ============================================================
const loginScreen = document.getElementById('loginScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const dashboard = document.getElementById('dashboard');
const logoutBtn = document.getElementById('logoutBtn');
const themeToggle = document.getElementById('themeToggle');

const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const sortOrder = document.getElementById('sortOrder');
const tableBody = document.getElementById('tableBody');
const emptyState = document.getElementById('emptyState');

const exportExcelBtn = document.getElementById('exportExcelBtn');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editName = document.getElementById('editName');
const editMobile = document.getElementById('editMobile');
const editIssue = document.getElementById('editIssue');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const THEME_KEY = 'pyadav_admin_theme';

let editingId = null;
let allRecords = [];
let unsubscribeSnapshot = null;

// ============================================================
// AUTH (Firebase)
// ============================================================
auth.onAuthStateChanged((user) => {
  if (user) {
    showDashboard();
  } else {
    showLogin();
  }
});

function showDashboard() {
  loginScreen.hidden = true;
  dashboard.hidden = false;
  startListening();
}

function showLogin() {
  dashboard.hidden = true;
  loginScreen.hidden = false;
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
    unsubscribeSnapshot = null;
  }
  allRecords = [];
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  loginError.hidden = true;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      loginForm.reset();
    })
    .catch((err) => {
      console.error(err);
      loginError.textContent = err.message || 'Incorrect email or password.';
      loginError.hidden = false;
    });
});

logoutBtn.addEventListener('click', () => {
  auth.signOut();
});

// ============================================================
// THEME
// ============================================================
function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀ Light' : '🌙 Dark Gold';
  localStorage.setItem(THEME_KEY, theme);
}

applyTheme(localStorage.getItem(THEME_KEY) || 'light');

themeToggle.addEventListener('click', () => {
  const current = document.body.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ============================================================
// DATA (Realtime Database, live updates)
// ============================================================
const appointmentsRef = database.ref('appointments');

function startListening() {
  if (unsubscribeSnapshot) return; // already listening

  appointmentsRef.on('value', (snapshot) => {
    const data = snapshot.val() || {};
    allRecords = Object.keys(data).map((key) => {
      const rec = data[key];
      return {
        id: key,
        fullName: rec.fullName || '',
        mobile: rec.mobile || '',
        issue: rec.issue || '',
        status: rec.status || 'new',
        createdAt: rec.createdAt
          ? new Date(rec.createdAt).toISOString()
          : new Date().toISOString()
      };
    });
    renderTable();
  }, (err) => {
    console.error('Realtime Database listener error:', err);
    alert('Could not load appointments. Check your Firebase config and database rules.');
  });

  unsubscribeSnapshot = () => appointmentsRef.off('value');
}

// ============================================================
// STATS
// ============================================================
function renderStats() {
  const records = allRecords;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const total = records.length;
  const today = records.filter(r => new Date(r.createdAt) >= startOfToday).length;
  const week = records.filter(r => new Date(r.createdAt) >= startOfWeek).length;
  const awaiting = records.filter(r => r.status === 'new').length;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statToday').textContent = today;
  document.getElementById('statWeek').textContent = week;
  document.getElementById('statNew').textContent = awaiting;
}

// ============================================================
// TABLE RENDER
// ============================================================
function getFilteredRecords() {
  let records = [...allRecords];

  const query = searchInput.value.trim().toLowerCase();
  if (query) {
    records = records.filter(r =>
      r.fullName.toLowerCase().includes(query) ||
      r.mobile.toLowerCase().includes(query) ||
      (r.issue || '').toLowerCase().includes(query)
    );
  }

  const status = statusFilter.value;
  if (status !== 'all') {
    records = records.filter(r => r.status === status);
  }

  records.sort((a, b) => {
    const diff = new Date(a.createdAt) - new Date(b.createdAt);
    return sortOrder.value === 'newest' ? -diff : diff;
  });

  return records;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function renderTable() {
  renderStats();

  const records = getFilteredRecords();
  tableBody.innerHTML = '';

  if (records.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  records.forEach(r => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${escapeHtml(r.fullName)}</td>
      <td>${escapeHtml(r.mobile)}</td>
      <td class="issue-cell">${escapeHtml(r.issue || '—')}</td>
      <td>${formatDate(r.createdAt)}</td>
      <td>
        <select class="status-select status-${r.status}" data-id="${r.id}">
          <option value="new" ${r.status === 'new' ? 'selected' : ''}>New</option>
          <option value="contacted" ${r.status === 'contacted' ? 'selected' : ''}>Contacted</option>
          <option value="resolved" ${r.status === 'resolved' ? 'selected' : ''}>Resolved</option>
        </select>
      </td>
      <td>
        <div class="row-actions">
          <a class="icon-btn" href="tel:${encodeURIComponent(r.mobile)}" title="Call">📞</a>
          <a class="icon-btn" href="https://wa.me/91${r.mobile.replace(/\D/g,'')}" target="_blank" title="WhatsApp">💬</a>
          <button class="icon-btn edit-btn" data-id="${r.id}" title="Edit">✏</button>
          <button class="icon-btn delete delete-btn" data-id="${r.id}" title="Delete">🗑</button>
        </div>
      </td>
    `;

    tableBody.appendChild(tr);
  });

  // Status change
  tableBody.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', () => {
      appointmentsRef.child(sel.dataset.id)
        .update({ status: sel.value })
        .catch((err) => alert('Could not update status: ' + err.message));
      // No manual re-render needed — the live listener will fire automatically
    });
  });

  // Delete
  tableBody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Delete this appointment? This cannot be undone.')) return;
      appointmentsRef.child(btn.dataset.id)
        .remove()
        .catch((err) => alert('Could not delete: ' + err.message));
    });
  });

  // Edit
  tableBody.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.id));
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
// EDIT MODAL
// ============================================================
function openEditModal(id) {
  const rec = allRecords.find(r => r.id === id);
  if (!rec) return;

  editingId = id;
  editName.value = rec.fullName;
  editMobile.value = rec.mobile;
  editIssue.value = rec.issue || '';
  editModal.hidden = false;
}

function closeEditModal() {
  editModal.hidden = true;
  editingId = null;
}

cancelEditBtn.addEventListener('click', closeEditModal);
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeEditModal();
});

editForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!editingId) return;

  appointmentsRef.child(editingId).update({
    fullName: editName.value.trim(),
    mobile: editMobile.value.trim(),
    issue: editIssue.value.trim()
  }).catch((err) => alert('Could not save changes: ' + err.message));

  closeEditModal();
});

// ============================================================
// SEARCH / FILTER / SORT
// ============================================================
searchInput.addEventListener('input', renderTable);
statusFilter.addEventListener('change', renderTable);
sortOrder.addEventListener('change', renderTable);

// ============================================================
// CLEAR ALL
// ============================================================
clearAllBtn.addEventListener('click', () => {
  if (!confirm('Delete ALL appointments? This cannot be undone.')) return;
  if (allRecords.length === 0) return;

  appointmentsRef.remove()
    .catch((err) => alert('Could not clear all: ' + err.message));
});

// ============================================================
// EXPORT — EXCEL (SheetJS)
// ============================================================
exportExcelBtn.addEventListener('click', () => {
  const records = getFilteredRecords();
  if (records.length === 0) { alert('No records to export.'); return; }

  const rows = records.map(r => ({
    Name: r.fullName,
    Mobile: r.mobile,
    Issue: r.issue || '',
    Status: r.status,
    'Received On': formatDate(r.createdAt)
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments');
  XLSX.writeFile(workbook, `appointments_${Date.now()}.xlsx`);
});

// ============================================================
// EXPORT — PDF (jsPDF + autotable)
// ============================================================
exportPdfBtn.addEventListener('click', () => {
  const records = getFilteredRecords();
  if (records.length === 0) { alert('No records to export.'); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text('Advocate Pratibha Yadav — Appointments', 14, 16);

  const rows = records.map(r => [
    r.fullName,
    r.mobile,
    r.issue || '—',
    r.status,
    formatDate(r.createdAt)
  ]);

  doc.autoTable({
    startY: 24,
    head: [['Name', 'Mobile', 'Issue', 'Status', 'Received On']],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [27, 42, 65] }
  });

  doc.save(`appointments_${Date.now()}.pdf`);
});
      
