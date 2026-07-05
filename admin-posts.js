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

  const adminPostsList = document.getElementById('adminPostsList');
  const postsEmptyState = document.getElementById('postsEmptyState');

  let allAdminPosts = [];
  let existingImageUrl = '';
  let pendingImageBase64 = null; // set once a new image is picked + compressed

  const MAX_IMAGE_WIDTH = 900;
  const IMAGE_QUALITY = 0.72;

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
    postPdfUrl.value = post.pdfUrl || '';

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
        pdfUrl: postPdfUrl.value.trim()
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
