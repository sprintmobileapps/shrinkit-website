/* ShrinkIt Website — main.js */

/* ── Nav scroll effect ─────────────────────────────────────── */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const toggle = () => nav.classList.toggle('nav--scrolled', window.scrollY > 10);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
})();

/* ── Hero canvas: converging particles ──────────────────────── */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], raf;
  const COUNT = 90;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor(spawn) {
      this.init(spawn === 'edge');
    }

    init(fromEdge) {
      const edge = Math.floor(Math.random() * 4);
      if (fromEdge) {
        if (edge === 0) { this.x = Math.random() * W; this.y = -4; }
        else if (edge === 1) { this.x = W + 4;           this.y = Math.random() * H; }
        else if (edge === 2) { this.x = Math.random() * W; this.y = H + 4; }
        else                 { this.x = -4;               this.y = Math.random() * H; }
      } else {
        // Random position on first load
        this.x = Math.random() * W;
        this.y = Math.random() * H;
      }

      // Vary speed so not all arrive at the same time
      this.speed = 0.35 + Math.random() * 0.55;
      this.size  = 1.2 + Math.random() * 1.8;

      // Color: mix of cobalt light (#ABC7FF) and teal light (#5EEAD4)
      const t = Math.random();
      if (t < 0.6) {
        // Cobalt variant
        this.r = 171; this.g = 199; this.b = 255;
      } else {
        // Teal variant
        this.r = 94; this.g = 234; this.b = 212;
      }
      this.alpha = 0.15 + Math.random() * 0.45;
      this.maxAlpha = this.alpha;
    }

    update() {
      const cx = W / 2;
      const cy = H / 2;
      const dx = cx - this.x;
      const dy = cy - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 6) {
        this.init(true);
        return;
      }

      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;

      // Fade out as they approach the center
      if (dist < 80) {
        this.alpha = this.maxAlpha * (dist / 80);
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.r},${this.g},${this.b},${this.alpha})`;
      ctx.fill();
    }
  }

  function init() {
    particles = Array.from({ length: COUNT }, () => new Particle(false));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Subtle radial glow at center
    const grd = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.min(W, H) * 0.35);
    grd.addColorStop(0, 'rgba(21,88,214,0.06)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    for (const p of particles) {
      p.update();
      p.draw();
    }
    raf = requestAnimationFrame(draw);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); init(); }, 100);
  });

  resize();
  init();
  draw();

  // Pause when not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); }
    else { draw(); }
  });
})();

/* ── FAQ accordion ─────────────────────────────────────────── */
(function () {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('faq-item--open');
      // Close all
      items.forEach(i => {
        i.classList.remove('faq-item--open');
        const a = i.querySelector('.faq-answer');
        if (a) a.style.maxHeight = null;
      });
      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('faq-item--open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });

    // ARIA
    btn.setAttribute('aria-expanded', 'false');
    const answerId = 'faq-answer-' + Math.random().toString(36).slice(2);
    answer.id = answerId;
    btn.setAttribute('aria-controls', answerId);

    const observer = new MutationObserver(() => {
      btn.setAttribute('aria-expanded', item.classList.contains('faq-item--open').toString());
    });
    observer.observe(item, { attributes: true, attributeFilter: ['class'] });
  });
})();

/* ── Scroll reveal ─────────────────────────────────────────── */
(function () {
  if (!('IntersectionObserver' in window)) {
    // Fallback: show all immediately
    document.querySelectorAll('.reveal, .stagger-children').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal, .stagger-children').forEach(el => {
    observer.observe(el);
  });
})();
