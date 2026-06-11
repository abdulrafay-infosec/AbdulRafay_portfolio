(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroBg = document.getElementById('heroBgWord');
  const expBg = document.getElementById('expBgText');

  if (!reduceMotion && (heroBg || expBg)) {
    window.addEventListener('scroll', () => {
      const sy = window.scrollY;
      if (heroBg) heroBg.style.transform = `translateY(calc(-50% + ${sy * 0.18}px))`;
      if (expBg) {
        const expSection = document.getElementById('experience');
        if (expSection) {
          const rect = expSection.getBoundingClientRect();
          expBg.style.transform = `translateY(${rect.top * 0.12}px)`;
        }
      }
    }, { passive: true });
  }

  /* ── CONTACT FORM ── */
  document.getElementById('contactForm') && document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const msg = document.getElementById('contactMessage').value;
    const subject = encodeURIComponent('Portfolio Inquiry from ' + name);
    const body = encodeURIComponent('Hi Abdul Rafay,\n\n' + msg + '\n\nFrom: ' + name + '\nReply to: ' + email);
    window.location.href = 'mailto:Abdul.rafay.cs@proton.me?subject=' + subject + '&body=' + body;
  });

  document.querySelectorAll('.cert-image-wrap img').forEach(img => {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
      img.addEventListener('error', () => { img.style.display = 'none'; });
    }
  });

  /* ── PROJECT FILTERS ── */
  const filters = document.querySelectorAll('.project-filter');
  const cards = document.querySelectorAll('.project-card');
  const rows = document.querySelectorAll('.project-row');

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filters.forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active);
      });
      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !show);
      });
      rows.forEach(row => {
        row.style.display = (filter === 'all' || row.dataset.category === filter) ? 'grid' : 'none';
      });
    });
  });

  /* ── PROJECT CARD INTERACTIONS ── */
  cards.forEach(card => {
    const media = card.querySelector('.project-card-media');
    const repoLink = card.querySelector('.project-btn-primary');
    const detailsBtn = card.querySelector('.project-btn-ghost');
    const detailsPanel = card.querySelector('.project-card-details');

    if (media && repoLink) {
      media.addEventListener('click', () => {
        if (repoLink.href) window.open(repoLink.href, '_blank', 'noopener,noreferrer');
      });
    }

    if (detailsBtn && detailsPanel) {
      detailsBtn.addEventListener('click', () => {
        const open = detailsPanel.hidden;
        detailsPanel.hidden = !open;
        detailsBtn.setAttribute('aria-expanded', open);
        detailsBtn.textContent = open ? 'Hide' : 'Details';
        card.classList.toggle('is-expanded', open);
      });
    }
  });

  /* ── GITHUB LIVE META (with localStorage caching) ── */
  const metaEls = document.querySelectorAll('.project-gh-meta[data-repo]');
  const GH_CACHE_KEY = 'gh_meta_cache';
  const GH_CACHE_TTL = 60 * 60 * 1000; // 1 hour

  function getGHCache() {
    try {
      const raw = localStorage.getItem(GH_CACHE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (Date.now() - (parsed._ts || 0) > GH_CACHE_TTL) {
        localStorage.removeItem(GH_CACHE_KEY);
        return {};
      }
      return parsed;
    } catch { return {}; }
  }

  function setGHCache(cache) {
    cache._ts = Date.now();
    try { localStorage.setItem(GH_CACHE_KEY, JSON.stringify(cache)); } catch {}
  }

  const ghCache = getGHCache();

  metaEls.forEach(async el => {
    const repo = el.dataset.repo;
    if (!repo) return;
    if (ghCache[repo]) {
      el.textContent = ghCache[repo];
      return;
    }
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}`);
      if (!res.ok) throw new Error('not found');
      const data = await res.json();
      const lang = data.language || 'Code';
      const updated = new Date(data.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const text = `${lang} · Updated ${updated}`;
      ghCache[repo] = text;
      setGHCache(ghCache);
      el.textContent = text;
    } catch {
      el.textContent = 'Public repo';
    }
  });

  document.querySelectorAll('.project-card-media img').forEach(img => {
    img.addEventListener('error', () => {
      img.src = 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=900&auto=format&fit=crop&q=80';
    });
  });
})();
