// ============================================================
// PUBLIC POSTS / LATEST UPDATES
// Reads from Firebase Realtime Database: posts/{postId}
// Fields: title, category, imageUrl, pdfUrl, content, pinned, createdAt
// ============================================================
(function () {
  const postsContainer = document.getElementById('postsContainer');
  const postsEmpty = document.getElementById('postsEmpty');
  const postSearch = document.getElementById('postSearch');
  const postCategoryFilter = document.getElementById('postCategoryFilter');

  if (!postsContainer || typeof database === 'undefined') return;

  let allPosts = [];

  database.ref('posts').on('value', (snapshot) => {
    const data = snapshot.val() || {};
    allPosts = Object.keys(data).map((key) => ({ id: key, ...data[key] }));

    // Pinned posts first, then newest first
    allPosts.sort((a, b) => {
      if (!!b.pinned !== !!a.pinned) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    populateCategoryFilter();
    renderPosts();
  }, (err) => {
    console.error('Could not load posts:', err);
  });

  function populateCategoryFilter() {
    if (!postCategoryFilter) return;
    const current = postCategoryFilter.value;
    const categories = [...new Set(allPosts.map(p => p.category).filter(Boolean))];

    postCategoryFilter.innerHTML = '<option value="all">All Categories</option>' +
      categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');

    if (categories.includes(current)) postCategoryFilter.value = current;
  }

  function getFiltered() {
    let posts = [...allPosts];

    const query = (postSearch && postSearch.value.trim().toLowerCase()) || '';
    if (query) {
      posts = posts.filter(p =>
        (p.title || '').toLowerCase().includes(query) ||
        (p.content || '').toLowerCase().includes(query) ||
        (p.category || '').toLowerCase().includes(query)
      );
    }

    const cat = (postCategoryFilter && postCategoryFilter.value) || 'all';
    if (cat !== 'all') {
      posts = posts.filter(p => p.category === cat);
    }

    return posts;
  }

  function formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function excerpt(text, len) {
    if (!text) return '';
    return text.length > len ? text.slice(0, len).trim() + '…' : text;
  }

  function renderPosts() {
    const posts = getFiltered();
    postsContainer.innerHTML = '';

    if (posts.length === 0) {
      postsEmpty.hidden = false;
      return;
    }
    postsEmpty.hidden = true;

    posts.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card post-card';
      card.innerHTML = `
        ${p.pinned ? '<span class="post-pin" title="Pinned">📌</span>' : ''}
        ${p.imageUrl ? `<img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.title || '')}" class="post-image" loading="lazy">` : ''}
        <div class="post-body">
          ${p.category ? `<span class="badge post-category">${escapeHtml(p.category)}</span>` : ''}
          <h3 class="post-title">${escapeHtml(p.title || '')}</h3>
          <p class="post-date">${formatDate(p.createdAt)}</p>
          <p class="post-excerpt">${escapeHtml(excerpt(p.content, 140))}</p>
          <a class="post-readmore" href="post.html?${p.slug ? 'post=' + encodeURIComponent(p.slug) : 'id=' + encodeURIComponent(p.id)}">Read More →</a>
        </div>
      `;
      postsContainer.appendChild(card);
    });
  }

  if (postSearch) postSearch.addEventListener('input', renderPosts);
  if (postCategoryFilter) postCategoryFilter.addEventListener('change', renderPosts);

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
})();
