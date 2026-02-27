// Welsh Coast Pizza Co. — Admin Panel JS

(function () {
  'use strict';

  var PASS_HASH = '0742ec032194bd8d1c9f08b7aacd2bfe2547f14306d05c180db3f0da234b1988';
  var REPO = 'welshcoastpizzaco-sys/welshcoastpizza';

  // --- DOM refs ---
  var loginScreen = document.getElementById('login-screen');
  var tokenScreen = document.getElementById('token-screen');
  var dashboard = document.getElementById('dashboard');
  var loginForm = document.getElementById('login-form');
  var loginError = document.getElementById('login-error');
  var tokenForm = document.getElementById('token-form');
  var tokenError = document.getElementById('token-error');
  var logoutBtn = document.getElementById('logout-btn');
  var menuList = document.getElementById('menu-list');
  var eventsList = document.getElementById('events-list');
  var addMenuBtn = document.getElementById('add-menu-btn');
  var addEventBtn = document.getElementById('add-event-btn');
  var addFaqBtn = document.getElementById('add-faq-btn');
  var saveMenuBtn = document.getElementById('save-menu-btn');
  var saveEventsBtn = document.getElementById('save-events-btn');
  var saveFaqBtn = document.getElementById('save-faq-btn');
  var faqList = document.getElementById('faq-list');
  var statusBar = document.getElementById('status-bar');
  var statusMsg = document.getElementById('status-msg');

  var ghToken = '';
  var menuData = [];
  var eventsData = [];
  var faqData = [];

  // --- Utility: SHA-256 hash ---
  function sha256(str) {
    var encoder = new TextEncoder();
    var data = encoder.encode(str);
    return crypto.subtle.digest('SHA-256', data).then(function (buf) {
      return Array.from(new Uint8Array(buf))
        .map(function (b) { return b.toString(16).padStart(2, '0'); })
        .join('');
    });
  }

  // --- Utility: show status ---
  function showStatus(msg, type) {
    statusBar.className = 'status-bar visible ' + type;
    statusMsg.textContent = msg;
    if (type === 'success') {
      setTimeout(function () { statusBar.className = 'status-bar'; }, 4000);
    }
  }

  // --- Utility: escape HTML ---
  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // --- Login ---
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var pw = document.getElementById('password').value;
    sha256(pw).then(function (hash) {
      if (hash === PASS_HASH) {
        sessionStorage.setItem('wcp_auth', '1');
        loginScreen.classList.add('hidden');
        if (sessionStorage.getItem('wcp_token')) {
          ghToken = sessionStorage.getItem('wcp_token');
          showDashboard();
        } else {
          tokenScreen.classList.remove('hidden');
        }
      } else {
        loginError.textContent = 'Incorrect password.';
      }
    });
  });

  // --- Token ---
  tokenForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var token = document.getElementById('gh-token').value.trim();
    // Validate token by making a test API call
    fetch('https://api.github.com/repos/' + REPO, {
      headers: { 'Authorization': 'token ' + token }
    }).then(function (res) {
      if (res.ok) {
        ghToken = token;
        sessionStorage.setItem('wcp_token', token);
        tokenScreen.classList.add('hidden');
        showDashboard();
      } else {
        tokenError.textContent = 'Invalid token or no access to repo.';
      }
    }).catch(function () {
      tokenError.textContent = 'Connection error. Please try again.';
    });
  });

  // --- Logout ---
  logoutBtn.addEventListener('click', function () {
    sessionStorage.clear();
    window.location.reload();
  });

  // --- Resume session ---
  if (sessionStorage.getItem('wcp_auth') === '1' && sessionStorage.getItem('wcp_token')) {
    ghToken = sessionStorage.getItem('wcp_token');
    loginScreen.classList.add('hidden');
    showDashboard();
  }

  // --- Show dashboard and load data ---
  function showDashboard() {
    dashboard.classList.remove('hidden');
    loadData();
  }

  function loadData() {
    Promise.all([
      fetch('data/menu.json?t=' + Date.now()).then(function (r) { return r.json(); }),
      fetch('data/events.json?t=' + Date.now()).then(function (r) { return r.json(); }),
      fetch('data/faq.json?t=' + Date.now()).then(function (r) { return r.json(); })
    ]).then(function (results) {
      menuData = results[0];
      eventsData = results[1];
      faqData = results[2];
      renderMenu();
      renderEvents();
      renderFaq();
    });
  }

  // --- Render menu editor ---
  function renderMenu() {
    menuList.innerHTML = menuData.map(function (item, i) {
      return '<div class="editor-item" data-index="' + i + '">' +
        '<div class="editor-item__fields">' +
          '<div class="editor-item__row">' +
            '<div class="form__group">' +
              '<label>Pizza Name</label>' +
              '<input type="text" class="menu-name" value="' + escapeAttr(item.name) + '">' +
            '</div>' +
          '</div>' +
          '<div class="form__group">' +
            '<label>Description</label>' +
            '<textarea class="menu-desc" rows="2">' + escapeAttr(item.description) + '</textarea>' +
          '</div>' +
        '</div>' +
        '<div class="editor-item__actions">' +
          (i > 0 ? '<button class="btn--icon move-up" title="Move up">&#9650;</button>' : '') +
          (i < menuData.length - 1 ? '<button class="btn--icon move-down" title="Move down">&#9660;</button>' : '') +
          '<button class="btn btn--small btn--danger remove-menu">Remove</button>' +
        '</div>' +
      '</div>';
    }).join('');

    // Bind events
    menuList.querySelectorAll('.remove-menu').forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        collectMenuData();
        menuData.splice(i, 1);
        renderMenu();
      });
    });
    menuList.querySelectorAll('.move-up').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.closest('.editor-item').dataset.index);
        collectMenuData();
        var tmp = menuData[idx];
        menuData[idx] = menuData[idx - 1];
        menuData[idx - 1] = tmp;
        renderMenu();
      });
    });
    menuList.querySelectorAll('.move-down').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.closest('.editor-item').dataset.index);
        collectMenuData();
        var tmp = menuData[idx];
        menuData[idx] = menuData[idx + 1];
        menuData[idx + 1] = tmp;
        renderMenu();
      });
    });
  }

  // --- Render events editor ---
  function renderEvents() {
    eventsList.innerHTML = eventsData.map(function (evt, i) {
      return '<div class="editor-item" data-index="' + i + '">' +
        '<div class="editor-item__fields">' +
          '<div class="editor-item__row">' +
            '<div class="form__group">' +
              '<label>Date</label>' +
              '<input type="text" class="event-date" value="' + escapeAttr(evt.date) + '" placeholder="e.g. Sat 8 March">' +
            '</div>' +
            '<div class="form__group">' +
              '<label>Location</label>' +
              '<input type="text" class="event-location" value="' + escapeAttr(evt.location) + '">' +
            '</div>' +
          '</div>' +
          '<div class="form__group">' +
            '<label>Details</label>' +
            '<textarea class="event-details" rows="2">' + escapeAttr(evt.details) + '</textarea>' +
          '</div>' +
        '</div>' +
        '<div class="editor-item__actions">' +
          (i > 0 ? '<button class="btn--icon move-up" title="Move up">&#9650;</button>' : '') +
          (i < eventsData.length - 1 ? '<button class="btn--icon move-down" title="Move down">&#9660;</button>' : '') +
          '<button class="btn btn--small btn--danger remove-event">Remove</button>' +
        '</div>' +
      '</div>';
    }).join('');

    eventsList.querySelectorAll('.remove-event').forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        collectEventsData();
        eventsData.splice(i, 1);
        renderEvents();
      });
    });
    eventsList.querySelectorAll('.move-up').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.closest('.editor-item').dataset.index);
        collectEventsData();
        var tmp = eventsData[idx];
        eventsData[idx] = eventsData[idx - 1];
        eventsData[idx - 1] = tmp;
        renderEvents();
      });
    });
    eventsList.querySelectorAll('.move-down').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.closest('.editor-item').dataset.index);
        collectEventsData();
        var tmp = eventsData[idx];
        eventsData[idx] = eventsData[idx + 1];
        eventsData[idx + 1] = tmp;
        renderEvents();
      });
    });
  }

  // --- Render FAQ editor ---
  function renderFaq() {
    faqList.innerHTML = faqData.map(function (faq, i) {
      return '<div class="editor-item" data-index="' + i + '">' +
        '<div class="editor-item__fields">' +
          '<div class="form__group">' +
            '<label>Question</label>' +
            '<input type="text" class="faq-question" value="' + escapeAttr(faq.question) + '">' +
          '</div>' +
          '<div class="form__group">' +
            '<label>Answer</label>' +
            '<textarea class="faq-answer" rows="3">' + escapeAttr(faq.answer) + '</textarea>' +
          '</div>' +
        '</div>' +
        '<div class="editor-item__actions">' +
          (i > 0 ? '<button class="btn--icon move-up" title="Move up">&#9650;</button>' : '') +
          (i < faqData.length - 1 ? '<button class="btn--icon move-down" title="Move down">&#9660;</button>' : '') +
          '<button class="btn btn--small btn--danger remove-faq">Remove</button>' +
        '</div>' +
      '</div>';
    }).join('');

    faqList.querySelectorAll('.remove-faq').forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        collectFaqData();
        faqData.splice(i, 1);
        renderFaq();
      });
    });
    faqList.querySelectorAll('.move-up').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.closest('.editor-item').dataset.index);
        collectFaqData();
        var tmp = faqData[idx];
        faqData[idx] = faqData[idx - 1];
        faqData[idx - 1] = tmp;
        renderFaq();
      });
    });
    faqList.querySelectorAll('.move-down').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.closest('.editor-item').dataset.index);
        collectFaqData();
        var tmp = faqData[idx];
        faqData[idx] = faqData[idx + 1];
        faqData[idx + 1] = tmp;
        renderFaq();
      });
    });
  }

  // --- Collect form data ---
  function collectFaqData() {
    var items = faqList.querySelectorAll('.editor-item');
    faqData = Array.from(items).map(function (el) {
      return {
        question: el.querySelector('.faq-question').value.trim(),
        answer: el.querySelector('.faq-answer').value.trim()
      };
    });
  }

  function collectMenuData() {
    var items = menuList.querySelectorAll('.editor-item');
    menuData = Array.from(items).map(function (el) {
      return {
        name: el.querySelector('.menu-name').value.trim(),
        description: el.querySelector('.menu-desc').value.trim()
      };
    });
  }

  function collectEventsData() {
    var items = eventsList.querySelectorAll('.editor-item');
    eventsData = Array.from(items).map(function (el) {
      return {
        date: el.querySelector('.event-date').value.trim(),
        location: el.querySelector('.event-location').value.trim(),
        details: el.querySelector('.event-details').value.trim()
      };
    });
  }

  // --- Add items ---
  addMenuBtn.addEventListener('click', function () {
    collectMenuData();
    menuData.push({ name: '', description: '' });
    renderMenu();
    menuList.lastElementChild.querySelector('.menu-name').focus();
  });

  addEventBtn.addEventListener('click', function () {
    collectEventsData();
    eventsData.push({ date: '', location: '', details: '' });
    renderEvents();
    eventsList.lastElementChild.querySelector('.event-date').focus();
  });

  addFaqBtn.addEventListener('click', function () {
    collectFaqData();
    faqData.push({ question: '', answer: '' });
    renderFaq();
    faqList.lastElementChild.querySelector('.faq-question').focus();
  });

  // --- Save to GitHub ---
  function saveFile(path, data, commitMsg) {
    // First get the current file SHA
    return fetch('https://api.github.com/repos/' + REPO + '/contents/' + path, {
      headers: { 'Authorization': 'token ' + ghToken }
    })
    .then(function (res) { return res.json(); })
    .then(function (file) {
      var content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2) + '\n')));
      return fetch('https://api.github.com/repos/' + REPO + '/contents/' + path, {
        method: 'PUT',
        headers: {
          'Authorization': 'token ' + ghToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: commitMsg,
          content: content,
          sha: file.sha
        })
      });
    });
  }

  saveMenuBtn.addEventListener('click', function () {
    collectMenuData();
    saveMenuBtn.disabled = true;
    showStatus('Saving menu...', 'saving');
    saveFile('data/menu.json', menuData, 'Update menu via admin panel')
      .then(function (res) {
        if (res.ok) {
          showStatus('Menu saved! Site will redeploy in a moment.', 'success');
        } else {
          throw new Error('Save failed');
        }
      })
      .catch(function () {
        showStatus('Error saving menu. Check your token and try again.', 'error');
      })
      .finally(function () {
        saveMenuBtn.disabled = false;
      });
  });

  saveEventsBtn.addEventListener('click', function () {
    collectEventsData();
    saveEventsBtn.disabled = true;
    showStatus('Saving events...', 'saving');
    saveFile('data/events.json', eventsData, 'Update events via admin panel')
      .then(function (res) {
        if (res.ok) {
          showStatus('Events saved! Site will redeploy in a moment.', 'success');
        } else {
          throw new Error('Save failed');
        }
      })
      .catch(function () {
        showStatus('Error saving events. Check your token and try again.', 'error');
      })
      .finally(function () {
        saveEventsBtn.disabled = false;
      });
  });

  saveFaqBtn.addEventListener('click', function () {
    collectFaqData();
    saveFaqBtn.disabled = true;
    showStatus('Saving FAQ...', 'saving');
    saveFile('data/faq.json', faqData, 'Update FAQ via admin panel')
      .then(function (res) {
        if (res.ok) {
          showStatus('FAQ saved! Site will redeploy in a moment.', 'success');
        } else {
          throw new Error('Save failed');
        }
      })
      .catch(function () {
        showStatus('Error saving FAQ. Check your token and try again.', 'error');
      })
      .finally(function () {
        saveFaqBtn.disabled = false;
      });
  });

})();
