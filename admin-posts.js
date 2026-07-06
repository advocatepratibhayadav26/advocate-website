// ============================================================
// ADMIN — MANAGE POSTS (No Firebase Storage / No Blaze plan needed)
// Firebase Realtime Database: posts/{postId}
// Images are resized + compressed in the browser and stored as
// a base64 string directly in the database (imageUrl field).
// PDFs are stored as an external link (e.g. Google Drive) in pdfUrl.
// ============================================================
(function () {
  const postsRef = database.ref('posts');

  const postForm = document.getElementById('postForm');
  const postFormTitle = document.getElementById('postFormTitle');
  const editingPostId = document.getElementById('editingPostId');
  const postTitle = document.getElementById('postTitle');
  const postCategory = document.getElementById('postCategory');
  const postImage = document.getElementById('postImage');
  const postImagePreview = document.getElementById('postImagePreview');
  const postPdfUrl = document.getElementById('postPdfUrl');
  const postContent = document.getElementById('postContent');
  const postPin = document.getElementById('postPin');
  const postSubmitBtn = document.getElementById('postSubmitBtn');
  const postCancelEditBtn = document.getElementById('postCancelEditBtn');
  const postFormStatus = document.getElementById('postFormStatus');

  const seoToggleBtn = document.getElementById('seoToggleBtn');
  const seoFieldsWrap = document.getElementById('seoFieldsWrap');
  const postSlug = document.getElementById('postSlug');
  const postMetaTitle = document.getElementById('postMetaTitle');
  const postMetaDescription = document.getElementById('postMetaDescription');
  const postFocusKeywords = document.getElementById('postFocusKeywords');
  const postImageAlt = document.getElementById('postImageAlt');
  const postCanonicalUrl = document.getElementById('postCanonicalUrl');
  const postTags = document.getElementById('postTags');
  const postAuthorName = document.getElementById('postAuthorName');
  const postPublishDate = document.getElementById('postPublishDate');
  const metaTitleCount = document.getElementById('metaTitleCount');
  const metaDescCount = document.getElementById('metaDescCount');
  const seoScoreValue = document.getElementById('seoScoreValue');
  const seoScoreBar = document.getElementById('seoScoreBar');
  const seoScoreChecklist = document.getElementById('seoScoreChecklist');

  let slugManuallyEdited = false;
  postPublishDate.value = new Date().toISOString().slice(0, 10);
  updateCounters();

  const adminPostsList = document.getElementById('adminPostsList');
  const postsEmptyState = document.getElementById('postsEmptyState');

  let allAdminPosts = [];
  let existingImageUrl = '';
  let pendingImageBase64 = null; // set once a new image is picked + compressed

  const MAX_IMAGE_WIDTH = 900;
  const IMAGE_QUALITY = 0.72;

  // ---------- SEO panel toggle ----------
  seoToggleBtn.addEventListener('click', () => {
    seoFieldsWrap.hidden = !seoFieldsWrap.hidden;
    seoToggleBtn.textContent = seoFieldsWrap.hidden ? '🔍 SEO Settings (Advanced) ▾' : '🔍 SEO Settings (Advanced) ▴';
  });

  // ---------- Slug auto-generate from title ----------
  function slugify(text) {
    return (text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  postTitle.addEventListener('input', () => {
    if (!slugManuallyEdited) {
      postSlug.value = slugify(postTitle.value);
    }
    updateSeoScore();
  });

  postSlug.addEventListener('input', () => {
    slugManuallyEdited = true;
    updateSeoScore();
  });

  // ---------- Live character counters ----------
  function updateCounters() {
    const titleLen = postMetaTitle.value.length;
    metaTitleCount.textContent = `${titleLen} / 60 characters (ideal)`;
    metaTitleCount.style.color = titleLen > 60 ? '#c0392b' : '';

    const descLen = postMetaDescription.value.length;
    metaDescCount.textContent = `${descLen} / 160 characters (ideal)`;
    metaDescCount.style.color = descLen > 160 ? '#c0392b' : '';
  }
  [postMetaTitle, postMetaDescription].forEach(el => el.addEventListener('input', () => { updateCounters(); updateSeoScore(); }));
  [postCategory, postContent, postFocusKeywords, postImageAlt].forEach(el => el.addEventListener('input', updateSeoScore));

  // ---------- Live SEO Score (Yoast-style checklist) ----------
  function updateSeoScore() {
    const checks = [];
    const title = postTitle.value.trim();
    const metaTitle = postMetaTitle.value.trim() || title;
    const metaDesc = postMetaDescription.value.trim();
    const content = postContent.value.trim();
    const keywords = postFocusKeywords.value.trim().split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    const mainKeyword = keywords[0] || '';
    const slug = postSlug.value.trim();
    const imgAlt = postImageAlt.value.trim();

    checks.push({ label: 'Title likha gaya hai', pass: title.length > 0 });
    checks.push({ label: 'Meta Title 60 characters ke andar hai', pass: metaTitle.length > 0 && metaTitle.length <= 60 });
    checks.push({ label: 'Meta Description 120-160 characters mein hai', pass: metaDesc.length >= 120 && metaDesc.length <= 160 });
    checks.push({ label: 'URL Slug diya gaya hai', pass: slug.length > 0 });
    checks.push({ label: 'Content kam se kam 300 characters ka hai', pass: content.length >= 300 });
    checks.push({ label: 'Focus Keyword diya gaya hai', pass: mainKeyword.length > 0 });
    checks.push({ label: 'Focus Keyword Title mein hai', pass: mainKeyword && title.toLowerCase().includes(mainKeyword) });
    checks.push({ label: 'Focus Keyword Meta Description mein hai', pass: mainKeyword && metaDesc.toLowerCase().includes(mainKeyword) });
    checks.push({ label: 'Focus Keyword Content mein hai', pass: mainKeyword && content.toLowerCase().includes(mainKeyword) });
    checks.push({ label: 'Image Alt Text diya gaya hai', pass: imgAlt.length > 0 });

    const passCount = checks.filter(c => c.pass).length;
    const score = Math.round((passCount / checks.length) * 100);

    seoScoreValue.textContent = `${score} / 100`;
    seoScoreBar.style.width = score + '%';
    seoScoreBar.style.background = score >= 80 ? '#2e7d32' : score >= 50 ? '#d9a441' : '#c0392b';

    seoScoreChecklist.innerHTML = checks.map(c =>
      `<li class="${c.pass ? 'pass' : 'fail'}">${c.label}</li>`
    ).join('');

    return score;
  }


  postsRef.on('value', (snapshot) => {
    const data = snapshot.val() || {};
    allAdminPosts = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
    allAdminPosts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    renderAdminPosts();
  }, (err) => {
    console.error('Could not load posts:', err);
  });

  function renderAdminPosts() {
    adminPostsList.innerHTML = '';

    if (allAdminPosts.length === 0) {
      postsEmptyState.hidden = false;
      return;
    }
    postsEmptyState.hidden = true;

    allAdminPosts.forEach(p => {
      const row = document.createElement('div');
      row.className = 'admin-post-row';
      row.innerHTML = `
        ${p.imageUrl ? `<img src="${escapeHtml(p.imageUrl)}" class="admin-post-thumb" alt="">` : '<div class="admin-post-thumb admin-post-thumb-empty">🖼️</div>'}
        <div class="admin-post-info">
          <p class="admin-post-title">${p.pinned ? '📌 ' : ''}${escapeHtml(p.title || '')}</p>
          <p class="admin-post-meta">${escapeHtml(p.category || '')} · ${p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : ''} ${p.seoScore !== undefined ? `· SEO: <b class="${p.seoScore >= 80 ? 'seo-good' : p.seoScore >= 50 ? 'seo-ok' : 'seo-bad'}">${p.seoScore}/100</b>` : ''}</p>
        </div>
        <div class="row-actions">
          <button class="icon-btn pin-btn" data-id="${p.id}" title="${p.pinned ? 'Unpin' : 'Pin'}">📌</button>
          <button class="icon-btn edit-post-btn" data-id="${p.id}" title="Edit">✏</button>
          <button class="icon-btn delete delete-post-btn" data-id="${p.id}" title="Delete">🗑</button>
        </div>
      `;
      adminPostsList.appendChild(row);
    });

    adminPostsList.querySelectorAll('.pin-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const post = allAdminPosts.find(p => p.id === btn.dataset.id);
        postsRef.child(btn.dataset.id).update({ pinned: !post.pinned })
          .catch(err => alert('Could not update pin: ' + err.message));
      });
    });

    adminPostsList.querySelectorAll('.edit-post-btn').forEach(btn => {
      btn.addEventListener('click', () => openEditPost(btn.dataset.id));
    });

    adminPostsList.querySelectorAll('.delete-post-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!confirm('Delete this post? This cannot be undone.')) return;
        postsRef.child(btn.dataset.id).remove()
          .catch(err => alert('Could not delete: ' + err.message));
      });
    });
  }

  // ---------- Edit ----------
  function openEditPost(id) {
    const post = allAdminPosts.find(p => p.id === id);
    if (!post) return;

    editingPostId.value = id;
    postFormTitle.textContent = '✏ Edit Post';
    postSubmitBtn.textContent = '💾 Save Changes';
    postCancelEditBtn.hidden = false;

    postTitle.value = post.title || '';
    postCategory.value = post.category || '';
    postContent.value = post.content || '';
    postPin.checked = !!post.pinned;
    postPdfUrl.value = post.pdfUrl || '';

    postSlug.value = post.slug || '';
    slugManuallyEdited = !!post.slug;
    postMetaTitle.value = post.metaTitle || '';
    postMetaDescription.value = post.metaDescription || '';
    postFocusKeywords.value = post.focusKeywords || '';
    postImageAlt.value = post.imageAlt || '';
    postCanonicalUrl.value = post.canonicalUrl || '';
    postTags.value = post.tags || '';
    postAuthorName.value = post.authorName || 'Advocate Pratibha Yadav';
    postPublishDate.value = post.publishDate || '';
    updateCounters();
    updateSeoScore();

    existingImageUrl = post.imageUrl || '';
    pendingImageBase64 = null;

    if (existingImageUrl) {
      postImagePreview.src = existingImageUrl;
      postImagePreview.hidden = false;
    } else {
      postImagePreview.hidden = true;
    }

    postForm.scrollIntoView({ behavior: 'smooth' });
  }

  postCancelEditBtn.addEventListener('click', resetForm);

  function resetForm() {
    postForm.reset();
    editingPostId.value = '';
    postFormTitle.textContent = '📝 Add New Post';
    postSubmitBtn.textContent = '📅 Publish';
    postCancelEditBtn.hidden = true;
    postImagePreview.hidden = true;
    existingImageUrl = '';
    pendingImageBase64 = null;
    slugManuallyEdited = false;
    postAuthorName.value = 'Advocate Pratibha Yadav';
    postPublishDate.value = new Date().toISOString().slice(0, 10);
    updateCounters();
    updateSeoScore();
  }

  // ---------- Image select -> resize + compress -> base64 ----------
  postImage.addEventListener('change', () => {
    const file = postImage.files[0];
    if (!file) return;

    resizeImageToBase64(file, MAX_IMAGE_WIDTH, IMAGE_QUALITY)
      .then((base64) => {
        pendingImageBase64 = base64;
        postImagePreview.src = base64;
        postImagePreview.hidden = false;
      })
      .catch((err) => {
        console.error(err);
        alert('Could not process image. Please try a different photo.');
      });
  });

  function resizeImageToBase64(file, maxWidth, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ---------- Submit (Publish / Save) ----------
  postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    postSubmitBtn.disabled = true;
    const originalLabel = postSubmitBtn.textContent;
    postSubmitBtn.textContent = 'Publishing…';
    hideStatus();

    try {
      const imageUrl = pendingImageBase64 || existingImageUrl || '';

      const record = {
        title: postTitle.value.trim(),
        category: postCategory.value.trim(),
        content: postContent.value.trim(),
        pinned: !!postPin.checked,
        imageUrl: imageUrl,
        pdfUrl: postPdfUrl.value.trim(),
        slug: postSlug.value.trim(),
        metaTitle: postMetaTitle.value.trim(),
        metaDescription: postMetaDescription.value.trim(),
        focusKeywords: postFocusKeywords.value.trim(),
        imageAlt: postImageAlt.value.trim(),
        canonicalUrl: postCanonicalUrl.value.trim(),
        tags: postTags.value.trim(),
        authorName: postAuthorName.value.trim() || 'Advocate Pratibha Yadav',
        publishDate: postPublishDate.value || new Date().toISOString().slice(0, 10),
        seoScore: updateSeoScore()
      };

      if (editingPostId.value) {
        await postsRef.child(editingPostId.value).update(record);
        showStatus('success', 'Post updated successfully.');
      } else {
        record.createdAt = firebase.database.ServerValue.TIMESTAMP;
        await postsRef.push(record);
        showStatus('success', 'Post published! It is now live on the website.');
      }

      resetForm();
    } catch (err) {
      console.error(err);
      showStatus('error', 'Could not save post: ' + err.message);
    } finally {
      postSubmitBtn.disabled = false;
      postSubmitBtn.textContent = originalLabel;
    }
  });

  function showStatus(type, message) {
    postFormStatus.className = 'form-status ' + type;
    postFormStatus.textContent = message;
    postFormStatus.hidden = false;
  }
  function hideStatus() {
    postFormStatus.hidden = true;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
})();
