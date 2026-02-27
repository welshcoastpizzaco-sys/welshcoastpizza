// Welsh Coast Pizza Co. — Main JS

(function () {
  'use strict';

  // --- Mobile nav toggle ---
  var hamburger = document.getElementById('hamburger');
  var nav = document.getElementById('nav');

  hamburger.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('open');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  nav.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // --- Header shadow on scroll ---
  var header = document.getElementById('header');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 10) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }, { passive: true });

  // --- Contact form — handled by Formsubmit.co ---

  // --- Load menu from JSON ---
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  fetch('data/menu.json')
    .then(function (res) { return res.json(); })
    .then(function (items) {
      var grid = document.getElementById('menu-grid');
      grid.innerHTML = items.map(function (item) {
        return '<div class="menu__card">' +
          '<h3 class="menu__name">' + escapeHtml(item.name) + '</h3>' +
          '<p class="menu__desc">' + escapeHtml(item.description) + '</p>' +
          '</div>';
      }).join('');
    });

  // --- Load events from JSON ---
  fetch('data/events.json')
    .then(function (res) { return res.json(); })
    .then(function (events) {
      var grid = document.getElementById('events-grid');
      grid.innerHTML = events.map(function (evt) {
        return '<div class="event__card">' +
          '<span class="event__date">' + escapeHtml(evt.date) + '</span>' +
          '<h3 class="event__location">' + escapeHtml(evt.location) + '</h3>' +
          '<p class="event__details">' + escapeHtml(evt.details) + '</p>' +
          '</div>';
      }).join('');
    });

})();
