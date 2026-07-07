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
    const plainExcerpt = post.metaDescription || stripHtml(post.content || '').slice(0, 155).trim();
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

    const robotsTag = document.getElementById('postRobots');
    if (robotsTag) robotsTag.setAttribute('content', post.robots === 'noindex' ? 'noindex,follow' : 'index,follow');

    const ogImg = document.getElementById('postOgImage');
    if (ogImg && post.imageUrl) ogImg.setAttribute('content', post.imageUrl);

    const twTitle = document.getElementById('postTwitterTitle');
    if (twTitle) twTitle.setAttribute('content', document.title);

    const twDesc = document.getElementById('postTwitterDescription');
    if (twDesc) twDesc.setAttribute('content', plainExcerpt || document.title);

    const twImg = document.getElementById('postTwitterImage');
    if (twImg && post.imageUrl) twImg.setAttribute('content', post.imageUrl);

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
    const videoEmbedUrl = getYouTubeEmbedUrl(post.videoUrl);
    const gallery = Array.isArray(post.galleryImages) ? post.galleryImages : [];

    postDetail.innerHTML = `
      ${post.category ? `<span class="badge post-category">${escapeHtml(post.category)}</span>` : ''}
      <h1 class="post-detail-title">${escapeHtml(post.title || '')}</h1>
      ${post.subtitle ? `<p class="post-detail-subtitle">${escapeHtml(post.subtitle)}</p>` : ''}
      <p class="post-date">${formatDate(post.publishDate ? new Date(post.publishDate).getTime() : post.createdAt)} ${authorName ? '· ' + escapeHtml(authorName) : ''}</p>
      ${post.imageUrl ? `<img src="${escapeHtml(post.imageUrl)}" alt="${escapeHtml(imgAltText)}" class="post-detail-image">` : ''}
      <div class="post-detail-content">${post.content || ''}</div>
      ${videoEmbedUrl ? `<div class="post-video-wrap"><iframe src="${videoEmbedUrl}" allowfullscreen loading="lazy"></iframe></div>` : ''}
      ${gallery.length ? `<div class="post-gallery-grid">${gallery.map(src => `<img src="${escapeHtml(src)}" alt="${escapeHtml(post.title || '')}">`).join('')}</div>` : ''}
      ${post.pdfUrl ? `<a href="${escapeHtml(post.pdfUrl)}" target="_blank" class="btn post-pdf-link">📄 Download Attachment</a>` : ''}
      <div class="post-share">
        <span class="post-share-label">Share:</span>
        <a href="${whatsappUrl}" target="_blank" class="share-btn share-whatsapp">💬 WhatsApp</a>
        <a href="${facebookUrl}" target="_blank" class="share-btn share-facebook">📘 Facebook</a>
      </div>
    `;

    buildTableOfContents();
  }

  // ---------- Auto Table of Contents ----------
  function buildTableOfContents() {
    const contentEl = postDetail.querySelector('.post-detail-content');
    if (!contentEl) return;

    const headings = contentEl.querySelectorAll('h3');
    if (headings.length < 2) return; // TOC not useful for very short posts

    const tocItems = [];
    headings.forEach((h, idx) => {
      const id = 'section-' + (idx + 1);
      h.id = id;
      tocItems.push(`<li><a href="#${id}">${h.textContent}</a></li>`);
    });

    const tocEl = document.createElement('div');
    tocEl.className = 'post-toc';
    tocEl.innerHTML = `
      <p class="post-toc-title">📑 इस पोस्ट में</p>
      <ul class="post-toc-list">${tocItems.join('')}</ul>
    `;
    contentEl.parentNode.insertBefore(tocEl, contentEl);
  }

  function getYouTubeEmbedUrl(url) {
    if (!url) return '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{6,})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
  }

  function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || '';
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
