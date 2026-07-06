(function () {
  const postDetail = document.getElementById('postDetail');
  const postNotFound = document.getElementById('postNotFound');
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('id');
  const postSlug = params.get('post');

  if (!postId && !postSlug) {
    showNotFound();
    return;
  }

  const lookup = postSlug
    ? database.ref('posts').orderByChild('slug').equalTo(postSlug).once('value')
        .then(snap => {
          if (!snap.exists()) return null;
          let result = null;
          snap.forEach(child => { result = { id: child.key, post: child.val() }; });
          return result;
        })
    : database.ref('posts/' + postId).once('value')
        .then(snap => snap.exists() ? { id: postId, post: snap.val() } : null);

  lookup
    .then((result) => {
      if (!result) {
        showNotFound();
        return;
      }
      renderPost(result.id, result.post);
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
    const displayTitle = post.metaTitle || post.title || 'Latest Update';
    document.title = displayTitle + ' | Advocate Pratibha Yadav';
    document.getElementById('postPageTitle').textContent = document.title;

    const pageUrl = post.canonicalUrl
      ? post.canonicalUrl
      : window.location.origin + window.location.pathname + (post.slug ? '?post=' + encodeURIComponent(post.slug) : '?id=' + encodeURIComponent(id));
    const plainExcerpt = post.metaDescription || (post.content || '').slice(0, 155).trim();
    const imgAltText = post.imageAlt || post.title || '';
    const authorName = post.authorName || 'Advocate Pratibha Yadav';

    const metaDesc = document.getElementById('postMetaDescription');
    if (metaDesc) metaDesc.setAttribute('content', plainExcerpt || document.title);

    const canonical = document.getElementById('postCanonical');
    if (canonical) canonical.setAttribute('href', pageUrl);

    const ogTitle = document.getElementById('postOgTitle');
    if (ogTitle) ogTitle.setAttribute('content', document.title);

    const ogDesc = document.getElementById('postOgDescription');
    if (ogDesc) ogDesc.setAttribute('content', plainExcerpt || document.title);

    if (post.focusKeywords) {
      const keywordsTag = document.createElement('meta');
      keywordsTag.name = 'keywords';
      keywordsTag.content = post.focusKeywords;
      document.head.appendChild(keywordsTag);
    }

    const authorTag = document.createElement('meta');
    authorTag.name = 'author';
    authorTag.content = authorName;
    document.head.appendChild(authorTag);

    injectSchema(id, post, pageUrl, plainExcerpt, authorName);

    const whatsappUrl = 'https://wa.me/?text=' + encodeURIComponent((post.title || 'Latest Update') + ' — ' + pageUrl);
    const facebookUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(pageUrl);

    postDetail.innerHTML = `
      ${post.category ? `<span class="badge post-category">${escapeHtml(post.category)}</span>` : ''}
      <h1 class="post-detail-title">${escapeHtml(post.title || '')}</h1>
      <p class="post-date">${formatDate(post.publishDate ? new Date(post.publishDate).getTime() : post.createdAt)} ${authorName ? '· ' + escapeHtml(authorName) : ''}</p>
      ${post.imageUrl ? `<img src="${escapeHtml(post.imageUrl)}" alt="${escapeHtml(imgAltText)}" class="post-detail-image">` : ''}
      <div class="post-detail-content">${escapeHtml(post.content || '').replace(/\n/g, '<br>')}</div>
      ${post.pdfUrl ? `<a href="${escapeHtml(post.pdfUrl)}" target="_blank" class="btn post-pdf-link">📄 Download Attachment</a>` : ''}
      <div class="post-share">
        <span class="post-share-label">Share:</span>
        <a href="${whatsappUrl}" target="_blank" class="share-btn share-whatsapp">💬 WhatsApp</a>
        <a href="${facebookUrl}" target="_blank" class="share-btn share-facebook">📘 Facebook</a>
      </div>
    `;
  }

  function injectSchema(id, post, pageUrl, plainExcerpt, authorName) {
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title || 'Latest Update',
      "description": plainExcerpt || post.title || '',
      "datePublished": post.publishDate ? new Date(post.publishDate).toISOString() : (post.createdAt ? new Date(post.createdAt).toISOString() : undefined),
      "image": post.imageUrl || undefined,
      "url": pageUrl,
      "keywords": post.focusKeywords || post.tags || undefined,
      "author": { "@type": "Person", "name": authorName },
      "publisher": { "@type": "LegalService", "name": "Advocate Pratibha Yadav" }
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://advocatepratibhayadav.in/" },
        { "@type": "ListItem", "position": 2, "name": "Latest Updates", "item": "https://advocatepratibhayadav.in/index.html#posts" },
        { "@type": "ListItem", "position": 3, "name": post.title || 'Update', "item": pageUrl }
      ]
    };

    addJsonLd(articleSchema);
    addJsonLd(breadcrumbSchema);
  }

  function addJsonLd(obj) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(obj);
    document.head.appendChild(script);
  }
})();
