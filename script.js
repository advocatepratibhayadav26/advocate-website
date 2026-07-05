// Mobile hamburger menu
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu after a link is tapped
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Appointment form -> saves to Firebase, sends email via EmailJS, then opens WhatsApp
const appointmentForm = document.getElementById('appointmentForm');

if (appointmentForm) {
  emailjs.init("usQhC7MdvtgvFHMtx");

  appointmentForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const submitBtn = appointmentForm.querySelector('button[type="submit"]');
    const fullName = document.getElementById('fullName').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const issue = document.getElementById('issue').value.trim();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Booking…';
    }

    // Save to Firebase first so the appointment is never lost even if
    // email/WhatsApp steps have an issue.
    saveAppointmentRecord(fullName, mobile, issue)
      .catch((err) => {
        console.error('Firebase save failed:', err);
        showFormStatus('error', 'Could not save your appointment. Please call us directly at 9454337340.');
      });

    emailjs.send('service_kit0x37', 'template_cmg5qlq', {
      fullName: fullName,
      mobile: mobile,
      issue: issue
    }).then(function () {
      const message =
        `New Appointment\n\n` +
        `Name: ${fullName}\n` +
        `Mobile: ${mobile}\n` +
        `Issue: ${issue || 'Not specified'}`;

      window.open(
        'https://wa.me/919454337340?text=' + encodeURIComponent(message),
        '_blank'
      );

      showFormStatus('success', 'Appointment booked! Opening WhatsApp…');
      appointmentForm.reset();
    }, function (error) {
      console.error('EmailJS error:', error);
      showFormStatus('error', 'Your appointment was saved, but the confirmation email failed. We will still contact you.');
    }).finally(function () {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '💬 Book via WhatsApp';
      }
    });
  });
}

function showFormStatus(type, message) {
  let statusEl = document.getElementById('appointmentStatus');
  if (!statusEl) {
    statusEl = document.createElement('p');
    statusEl.id = 'appointmentStatus';
    appointmentForm.appendChild(statusEl);
  }
  statusEl.className = 'form-status ' + type;
  statusEl.textContent = message;
}

// Save a submitted appointment to Firebase Realtime Database (shared, cross-device — feeds admin.html).
// Falls back to localStorage only if the database isn't reachable/configured,
// so a form submission never fails just because of this. Returns a Promise.
function saveAppointmentRecord(fullName, mobile, issue) {
  const record = {
    fullName: fullName,
    mobile: mobile,
    issue: issue,
    status: 'new' // new | contacted | resolved
  };

  if (typeof database !== 'undefined' && database) {
    return database.ref('appointments').push({
      ...record,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    });
  } else {
    saveToLocalStorage(record);
    return Promise.resolve();
  }
}

function saveToLocalStorage(record) {
  const STORAGE_KEY = 'pyadav_appointments';
  let records = [];

  try {
    records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (err) {
    records = [];
  }

  records.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    createdAt: new Date().toISOString(),
    ...record
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}
