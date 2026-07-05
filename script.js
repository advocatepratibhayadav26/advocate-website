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

// Appointment form -> sends email via EmailJS, then opens WhatsApp with the details
const appointmentForm = document.getElementById('appointmentForm');

if (appointmentForm) {
  emailjs.init("usQhC7MdvtgvFHMtx");

  appointmentForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const issue = document.getElementById('issue').value.trim();

    emailjs.send('service_kit0x37', 'template_cmg5qlq', {
      fullName: fullName,
      mobile: mobile,
      issue: issue
    }).then(function () {

      // Save a copy locally so it shows up in admin.html
      saveAppointmentRecord(fullName, mobile, issue);

      const message =
        `New Appointment\n\n` +
        `Name: ${fullName}\n` +
        `Mobile: ${mobile}\n` +
        `Issue: ${issue || 'Not specified'}`;

      window.open('https://wa.me/919454337340?text=' + encodeURIComponent(message), '_blank');

      alert('Appointment Submitted Successfully!');
      appointmentForm.reset();

    }, function (error) {
      alert('Email Error: ' + JSON.stringify(error));
    });
  });
}

// Save a submitted appointment to Firebase Realtime Database (shared, cross-device — feeds admin.html).
// Falls back to localStorage only if the database isn't reachable/configured,
// so a form submission never fails just because of this.
function saveAppointmentRecord(fullName, mobile, issue) {
  alert("saveAppointmentRecord Called");

  const record = {
    fullName: fullName,
    mobile: mobile,
    issue: issue,
    status: 'new' // new | contacted | resolved
  };

  if (typeof database !== 'undefined' && database) {
    database.ref('appointments').push({
      ...record,
      createdAt: firebase.database.ServerValue.TIMESTAMP
    }).then(function () {
      alert("Firebase Save Success");
    }).catch(function (err) {
      alert("Firebase Error:\n" + err.code + "\n" + err.message);
      console.error(err);
    });
  } else {
    saveToLocalStorage(record);
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
