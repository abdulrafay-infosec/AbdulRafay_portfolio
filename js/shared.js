(function () {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    /* Escape key closes mobile menu */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        toggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        toggle.focus();
      }
    });
  }

  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduceMotion) {
      revealEls.forEach(el => el.classList.add('visible'));
    } else {
      const revealObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.08 });
      revealEls.forEach(el => revealObs.observe(el));
    }
  }

  if (finePointer && !reduceMotion) {
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursor-ring');
    if (cursor && ring) {
      document.body.classList.add('custom-cursor');
      let mx = 0, my = 0, rx = 0, ry = 0;

      document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        cursor.style.left = mx + 'px';
        cursor.style.top = my + 'px';
      });

      let animRunning = true;
      (function animRing() {
        if (!animRunning) { requestAnimationFrame(animRing); return; }
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
        requestAnimationFrame(animRing);
      })();

      /* Pause cursor animation when tab is hidden */
      document.addEventListener('visibilitychange', () => {
        animRunning = !document.hidden;
      });

      document.querySelectorAll('a, button, .cred-card, .cert-item, .skill-chip, .project-card, .project-filter, input, textarea').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
      });
    }
  }

  /* ── LINKEDIN CAROUSEL DOTS ── */
  const liC = document.getElementById('liCarousel');
  if (liC) {
    liC.addEventListener('scroll', () => {
      const idx = Math.round(liC.scrollLeft / 320);
      for (let i = 0; i < 5; i++) {
        const d = document.getElementById('liDot' + i);
        if (d) d.style.background = i === idx ? 'var(--blue)' : 'var(--border)';
      }
    }, { passive: true });
  }
})();

class PlexusSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.dust = [];
    this.mouse = { x: -1000, y: -1000, radius: 120 };
    this.colors = ['rgba(30, 74, 184, ', 'rgba(10, 107, 93, ']; // Site Blue & Teal
    
    this.init();
    
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2 + 100; // Lower center for perspective
  }

  init() {
    this.resize();
    this.particles = [];
    this.dust = [];

    // Optimized node count for smooth 60fps
    const numParticles = Math.min(window.innerWidth / 8, 250); 
    for (let i = 0; i < numParticles; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      this.particles.push(new PlexusNode(x, y, this));
    }

    // Floating debris
    const numDust = 60;
    for (let i = 0; i < numDust; i++) {
      this.dust.push(new DustNode(this));
    }

    this.animate();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.drawConnections();

    this.particles.forEach(p => { p.update(); p.draw(); });
    this.dust.forEach(d => { d.update(); d.draw(); });

    requestAnimationFrame(() => this.animate());
  }

  drawConnections() {
    const maxDistSq = 120 * 120; // Fast distance check
    this.ctx.lineWidth = 1;
    
    for (let i = 0; i < this.particles.length; i++) {
      const p1 = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        
        // Fast bounding box check to skip heavy math
        if (Math.abs(p1.x - p2.x) > 120 || Math.abs(p1.y - p2.y) > 120) continue;

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx*dx + dy*dy;

        if (distSq < maxDistSq) {
          const opacity = (1 - distSq / maxDistSq) * 0.7;
          
          let finalOpacity = opacity;
          if (p1.interactiveOpacity > 0 || p2.interactiveOpacity > 0) {
            finalOpacity += Math.max(p1.interactiveOpacity, p2.interactiveOpacity) * 0.5;
          }

          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(30, 74, 184, ${finalOpacity.toFixed(2)})`;
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y); 
          this.ctx.stroke();
        }
      }
    }
  }
}

class PlexusNode {
  constructor(x, y, system) {
    this.system = system;
    this.x = x; this.y = y;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.2 - 0.2; // Upward drift
    this.baseRadius = Math.random() * 1.8 + 0.8;
    this.radius = this.baseRadius;
    this.colorBase = system.colors[Math.floor(Math.random() * system.colors.length)];
    this.interactiveOpacity = 0;
  }

  update() {
    this.x += this.vx; this.y += this.vy;

    if (this.x < 0 || this.x > this.system.canvas.width) this.vx *= -1;
    if (this.y < -100) {
      this.y = this.system.canvas.height + 100;
      this.x = this.system.centerX + (Math.random() - 0.5) * this.system.canvas.width;
    }

    const dx = this.system.mouse.x - this.x;
    const dy = this.system.mouse.y - this.y;
    
    if (Math.abs(dx) < this.system.mouse.radius && Math.abs(dy) < this.system.mouse.radius) {
      const distSq = dx*dx + dy*dy;
      const radiusSq = this.system.mouse.radius * this.system.mouse.radius;
      
      if (distSq < radiusSq) {
        const dist = Math.sqrt(distSq);
        const forceDirectionX = dx / dist;
        const forceDirectionY = dy / dist;
        const force = (this.system.mouse.radius - dist) / this.system.mouse.radius;
        
        this.x -= forceDirectionX * force * 3;
        this.y -= forceDirectionY * force * 3;
        
        this.interactiveOpacity = force;
        this.radius = this.baseRadius + force * 2;
      }
    } else {
      if (this.interactiveOpacity > 0) {
        this.interactiveOpacity = Math.max(0, this.interactiveOpacity - 0.05);
        this.radius = Math.max(this.baseRadius, this.radius - 0.1);
      }
    }
  }

  draw() {
    const ctx = this.system.ctx;
    const opacity = 0.6 + this.interactiveOpacity * 0.4;
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.colorBase + opacity.toFixed(2) + ')';
    ctx.fill();

    // Fast rendering glow effect
    if (this.interactiveOpacity > 0.1) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = this.colorBase + (this.interactiveOpacity * 0.2).toFixed(2) + ')';
      ctx.fill();
    }
  }
}

class DustNode {
  constructor(system) {
    this.system = system;
    this.reset();
    this.y = Math.random() * system.canvas.height;
  }
  reset() {
    this.x = Math.random() * this.system.canvas.width;
    this.y = this.system.canvas.height + 10;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = -(Math.random() * 0.8 + 0.2);
    this.radius = Math.random() * 1.2 + 0.2;
    this.colorBase = this.system.colors[Math.floor(Math.random() * this.system.colors.length)];
    this.opacity = Math.random() * 0.5 + 0.3;
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    this.x += Math.sin(this.y * 0.02) * 0.2;
    if (this.y < -10) this.reset();
  }
  draw() {
    const ctx = this.system.ctx;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.colorBase + this.opacity.toFixed(2) + ')';
    ctx.fill();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('bg-canvas');
  if (canvas) new PlexusSystem(canvas);
});
