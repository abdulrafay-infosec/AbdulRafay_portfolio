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
          expBg.style.transform = `translateY(${-rect.top * 0.12}px)`;
        }
      }
    }, { passive: true });
  }

  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const message = form.querySelector('[name="message"]').value.trim();
      const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      window.location.href = `mailto:Abdul.rafay.cs@proton.me?subject=${subject}&body=${body}`;
      if (success) {
        success.classList.add('show');
        success.textContent = 'Your email client should open shortly. If it does not, email Abdul.rafay.cs@proton.me directly.';
      }
    });
  }

  document.querySelectorAll('.cert-image-wrap img').forEach(img => {
    img.addEventListener('load', () => img.classList.add('loaded'));
    img.addEventListener('error', () => { img.style.display = 'none'; });
  });

  /* ── PROJECT FILTERS ── */
  const filters = document.querySelectorAll('.project-filter');
  const cards = document.querySelectorAll('.project-card');

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filters.forEach(b => b.classList.toggle('active', b === btn));
      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !show);
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

  /* ── GITHUB LIVE META ── */
  const metaEls = document.querySelectorAll('.project-gh-meta[data-repo]');
  const cache = new Map();

  metaEls.forEach(async el => {
    const repo = el.dataset.repo;
    if (!repo || cache.has(repo)) {
      if (cache.has(repo)) el.textContent = cache.get(repo);
      return;
    }
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}`);
      if (!res.ok) throw new Error('not found');
      const data = await res.json();
      const lang = data.language || 'Code';
      const updated = new Date(data.updated_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const text = `${lang} · Updated ${updated}`;
      cache.set(repo, text);
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
