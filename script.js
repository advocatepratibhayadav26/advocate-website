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
