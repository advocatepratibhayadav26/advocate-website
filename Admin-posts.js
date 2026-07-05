// ============================================================
// ADMIN — MANAGE POSTS
// Firebase Realtime Database: posts/{postId}
// Firebase Storage: posts/{timestamp}_{filename} (images & PDFs)
// ============================================================
(function () {
  const storage = firebase.storage();
  const postsRef = database.ref('posts');

  const postForm = document.getElementById('postForm');
  const postFormTitle = document.getElementById('postFormTitle');
  const editingPostId = document.getElementById('editingPostId');
  const postTitle = document.getElementById('postTitle');
  const postCategory = document.getElementById('postCategory');
  const postImage = document.getElementById('postImage');
  const postImagePreview = document.getElementById('postImagePreview');
  const postImageProgress = document.getElementById('postImageProgress');
  const postPdf = document.getElementById('postPdf');
  const postPdfName = document.getElementById('postPdfName');
  const postPdfProgress = document.getElementById('postPdfProgress');
  const postContent = document.getElementById('postContent');
  const postPin = document.getElementById('postPin');
  const postSubmitBtn = document.getElementById('postSubmitBtn');
  const postCancelEditBtn = document.getElementById('postCancelEditBtn');
  const postFormStatus = document.getElementById('postFormStatus');

  const adminPostsList = document.getElementById('adminPostsList');
  const postsEmptyState = document.getElementById('postsEmptyState');

  let allAdminPosts = [];
  let existingImageUrl = '';
  let existingPdfUrl = '';

  // ---------- Live list of posts ----------
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
          <p class="admin-post-meta">${escapeHtml(p.category || '')} · ${p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : ''}</p>
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

    existingImageUrl = post.imageUrl || '';
    existingPdfUrl = post.pdfUrl || '';

    if (existingImageUrl) {
      postImagePreview.src = existingImageUrl;
      postImagePreview.hidden = false;
    } else {
      postImagePreview.hidden = true;
    }
    postPdfName.textContent = existingPdfUrl ? 'Current attachment already uploaded.' : '';

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
    postPdfName.textContent = '';
    existingImageUrl = '';
    existingPdfUrl = '';
  }

  // ---------- Image preview ----------
  postImage.addEventListener('change', () => {
    const file = postImage.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      postImagePreview.src = e.target.result;
      postImagePreview.hidden = false;
    };
    reader.readAsDataURL(file);
  });

  postPdf.addEventListener('change', () => {
    const file = postPdf.files[0];
    postPdfName.textContent = file ? '📎 ' + file.name : '';
  });

  // ---------- Upload helper ----------
  function uploadFile(file, folder, progressEl) {
    return new Promise((resolve, reject) => {
      const path = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
      const task = storage.ref(path).put(file);
      progressEl.hidden = false;

      task.on('state_changed', (snap) => {
        progressEl.value = (snap.bytesTransferred / snap.totalBytes) * 100;
      }, (err) => {
        progressEl.hidden = true;
        reject(err);
      }, () => {
        progressEl.hidden = true;
        task.snapshot.ref.getDownloadURL().then(resolve).catch(reject);
      });
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
      let imageUrl = existingImageUrl;
      let pdfUrl = existingPdfUrl;

      if (postImage.files[0]) {
        imageUrl = await uploadFile(postImage.files[0], 'posts', postImageProgress);
      }
      if (postPdf.files[0]) {
        pdfUrl = await uploadFile(postPdf.files[0], 'posts-pdf', postPdfProgress);
      }

      const record = {
        title: postTitle.value.trim(),
        category: postCategory.value.trim(),
        content: postContent.value.trim(),
        pinned: !!postPin.checked,
        imageUrl: imageUrl || '',
        pdfUrl: pdfUrl || ''
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
