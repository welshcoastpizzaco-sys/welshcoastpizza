// Welsh Coast Pizza Co. — Main JS

(function () {
  'use strict';

  // --- Mobile nav toggle ---
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  hamburger.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('open');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile nav when a link is clicked
  nav.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // --- Header shadow on scroll ---
  const header = document.getElementById('header');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }, { passive: true });

  // --- Contact form handling ---
  var form = document.getElementById('contact-form');

  form.addEventListener('submit', function (e) {
    // If using Formspree with a real endpoint, let it submit normally.
    // For now, prevent default and show a confirmation.
    if (form.action.includes('placeholder')) {
      e.preventDefault();
      alert('Thanks for your message! We\'ll get back to you soon.');
      form.reset();
    }
  });
})();
