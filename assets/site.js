(function () {
  var saved = localStorage.getItem('toughnk-theme');
  if (saved === 'dark' || saved === 'light') {
    document.documentElement.setAttribute('data-theme', saved);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var cur = document.documentElement.getAttribute('data-theme') || 'light';
        var next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('toughnk-theme', next);
      });
    }

    // Copy buttons for code blocks
    document.querySelectorAll('.copy-btn').forEach(function (el) {
      el.addEventListener('click', function () {
        var pre = el.parentElement.querySelector('pre');
        var text = pre ? pre.innerText : el.parentElement.innerText.replace(/^复制\s*/, '');
        navigator.clipboard.writeText(text.trim()).then(function () {
          el.textContent = '已复制';
          setTimeout(function () { el.textContent = '复制'; }, 1500);
        });
      });
    });

    // Auto-generate TOC for migrated articles
    var tocNav = document.getElementById('autoToc');
    if (tocNav) {
      var headings = document.querySelectorAll('article h2, article h3, article h4');
      if (headings.length < 2) {
        var layout = document.querySelector('.layout');
        if (layout) layout.classList.add('no-toc');
        if (tocNav.parentElement) tocNav.parentElement.style.display = 'none';
      } else {
        headings.forEach(function (h, idx) {
          if (!h.id) h.id = 'sec-' + idx;
          var a = document.createElement('a');
          a.href = '#' + h.id;
          a.textContent = h.textContent.trim();
          if (h.tagName === 'H3' || h.tagName === 'H4') a.className = 'toc-sub';
          tocNav.appendChild(a);
        });
      }
    }

    // Search filter for home & archive pages
    var searchInput = document.getElementById('searchInput');
    if (searchInput) {
      var items = Array.from(document.querySelectorAll('[data-search-item]'));
      var empty = document.getElementById('emptyState');
      searchInput.addEventListener('input', function () {
        var q = searchInput.value.trim().toLowerCase();
        var visible = 0;
        items.forEach(function (item) {
          var hay = (item.innerText + ' ' + (item.getAttribute('data-keywords') || '')).toLowerCase();
          var show = !q || hay.indexOf(q) !== -1;
          item.style.display = show ? '' : 'none';
          if (show) visible++;
        });
        document.querySelectorAll('.year-group').forEach(function (g) {
          var any = Array.from(g.querySelectorAll('[data-search-item]')).some(function (el) {
            return el.style.display !== 'none';
          });
          g.style.display = any ? '' : 'none';
        });
        if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
      });
    }
  });
})();
