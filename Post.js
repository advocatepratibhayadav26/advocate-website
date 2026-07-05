(function () {
  const postDetail = document.getElementById('postDetail');
  const postNotFound = document.getElementById('postNotFound');
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('id');

  if (!postId) {
    showNotFound();
    return;
  }

  database.ref('posts/' + postId).once('value')
    .then((snapshot) => {
      const post = snapshot.val();
      if (!post) {
        showNotFound();
        return;
      }
      renderPost(postId, post);
    })
    .catch((err) => {
      console.error(err);
      showNotFound();
    });

  function showNotFound() {
    postDetail.hidden = true;
    postNotFound.hidden = false;
  }

  function formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function renderPost(id, post) {
    document.title = (post.title || 'Latest Update') + ' | Advocate Pratibha Yadav';
    document.getElementById('postPageTitle').textContent = document.title;

    const pageUrl = window.location.origin + window.location.pathname + '?id=' + encodeURIComponent(id);
    const whatsappUrl = 'https://wa.me/?text=' + encodeURIComponent((post.title || 'Latest Update') + ' — ' + pageUrl);
    const facebookUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(pageUrl);

    postDetail.innerHTML = `
      ${post.category ? `<span class="badge post-category">${escapeHtml(post.category)}</span>` : ''}
      <h1 class="post-detail-title">${escapeHtml(post.title || '')}</h1>
      <p class="post-date">${formatDate(post.createdAt)}</p>
      ${post.imageUrl ? `<img src="${escapeHtml(post.imageUrl)}" alt="${escapeHtml(post.title || '')}" class="post-detail-image">` : ''}
      <div class="post-detail-content">${escapeHtml(post.content || '').replace(/\n/g, '<br>')}</div>
      ${post.pdfUrl ? `<a href="${escapeHtml(post.pdfUrl)}" target="_blank" class="btn post-pdf-link">📄 Download Attachment</a>` : ''}
      <div class="post-share">
        <span class="post-share-label">Share:</span>
        <a href="${whatsappUrl}" target="_blank" class="share-btn share-whatsapp">💬 WhatsApp</a>
        <a href="${facebookUrl}" target="_blank" class="share-btn share-facebook">📘 Facebook</a>
      </div>
    `;
  }
})();
