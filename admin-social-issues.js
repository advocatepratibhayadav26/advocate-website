// ============================================================
// ADMIN — SOCIAL ISSUES MANAGEMENT
// Firebase Realtime Database: socialIssues/{id} (private, full data)
// Curated public copy: publicSocialIssues/{id} (only when published)
// ============================================================
(function () {
  const issuesRef = database.ref('socialIssues');
  const listEl = document.getElementById('adminIssuesList');
  const emptyEl = document.getElementById('issuesEmptyState');
  const searchInput = document.getElementById('issueSearchInput');
  const statusFilter = document.getElementById('issueStatusFilter');

  let allIssues = [];

  issuesRef.on('value', (snapshot) => {
    const data = snapshot.val() || {};
    allIssues = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
    allIssues.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    render();
  }, (err) => console.error('Could not load social issues:', err));

  function getFiltered() {
    let items = [...allIssues];
    const q = (searchInput.value || '').trim().toLowerCase();
    if (q) {
      items = items.filter(i =>
        (i.location || '').toLowerCase().includes(q) ||
        (i.category || '').toLowerCase().includes(q) ||
        (i.name || '').toLowerCase().includes(q) ||
        (i.description || '').toLowerCase().includes(q)
      );
    }
    const status = statusFilter.value;
    if (status !== 'all') items = items.filter(i => (i.status || 'new') === status);
    return items;
  }

  function render() {
    const items = getFiltered();
    listEl.innerHTML = '';

    if (items.length === 0) {
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'admin-issue-row';
      row.innerHTML = `
        ${item.imageUrl ? `<img src="${escapeHtml(item.imageUrl)}" class="admin-post-thumb" alt="">` : '<div class="admin-post-thumb admin-post-thumb-empty">📢</div>'}
        <div class="admin-post-info">
          <p class="admin-post-title">${escapeHtml(item.category || '')} — 📍 ${escapeHtml(item.location || '')}</p>
          <p class="admin-post-meta">${escapeHtml(item.name || 'गुमनाम')} ${item.contact ? '· ' + escapeHtml(item.contact) : ''} · ${item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : ''}</p>
          <p class="admin-issue-desc">${escapeHtml(item.description || '')}</p>
        </div>
        <div class="admin-issue-controls">
          <select class="issue-status-select" data-id="${item.id}">
            <option value="new" ${item.status === 'new' ? 'selected' : ''}>New</option>
            <option value="under-review" ${item.status === 'under-review' ? 'selected' : ''}>Under Review</option>
            <option value="escalated" ${item.status === 'escalated' ? 'selected' : ''}>Escalated</option>
            <option value="resolved" ${item.status === 'resolved' ? 'selected' : ''}>Resolved</option>
          </select>
          <label class="issue-publish-label">
            <input type="checkbox" class="issue-publish-toggle" data-id="${item.id}" ${item.published ? 'checked' : ''}>
            Website पर दिखाएं
          </label>
          <button class="icon-btn delete issue-delete-btn" data-id="${item.id}" title="Delete">🗑</button>
        </div>
      `;
      listEl.appendChild(row);
    });

    listEl.querySelectorAll('.issue-status-select').forEach(sel => {
      sel.addEventListener('change', () => {
        issuesRef.child(sel.dataset.id).update({ status: sel.value })
          .catch(err => alert('Could not update status: ' + err.message));
      });
    });

    listEl.querySelectorAll('.issue-publish-toggle').forEach(chk => {
      chk.addEventListener('change', () => {
        const issue = allIssues.find(i => i.id === chk.dataset.id);
        if (chk.checked) {
          publishIssue(issue);
        } else {
          unpublishIssue(issue.id);
        }
      });
    });

    listEl.querySelectorAll('.issue-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('यह मुद्दा हमेशा के लिए हटाना है?')) return;
        issuesRef.child(btn.dataset.id).remove().catch(err => alert('Could not delete: ' + err.message));
        database.ref('publicSocialIssues/' + btn.dataset.id).remove().catch(() => {});
      });
    });
  }

  function publishIssue(issue) {
    const publicRecord = {
      displayName: issue.showNamePublicly && issue.name ? issue.name : 'गुमनाम नागरिक',
      location: issue.location || '',
      category: issue.category || '',
      description: issue.description || '',
      imageUrl: issue.imageUrl || '',
      publishedAt: firebase.database.ServerValue.TIMESTAMP
    };
    Promise.all([
      database.ref('publicSocialIssues/' + issue.id).set(publicRecord),
      issuesRef.child(issue.id).update({ published: true })
    ]).catch(err => alert('Could not publish: ' + err.message));
  }

  function unpublishIssue(id) {
    Promise.all([
      database.ref('publicSocialIssues/' + id).remove(),
      issuesRef.child(id).update({ published: false })
    ]).catch(err => alert('Could not unpublish: ' + err.message));
  }

  searchInput.addEventListener('input', render);
  statusFilter.addEventListener('change', render);

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
})();
