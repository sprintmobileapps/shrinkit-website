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

/* ── Campaign tags (?utm_source=…&utm_campaign=…) ──────────── */
// A paid link such as /?utm_source=firefaucet swaps "website" for that source in every Play button's
// install referrer, so the installs show up under their own source in Play Console and Firebase.
// utm_medium keeps naming the button (nav, hero, cta, footer); utm_campaign stays "site" unless given.
(function () {
  const params = new URLSearchParams(window.location.search);
  const clean = (v) => (v || '').toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 40);
  const source = clean(params.get('utm_source'));
  if (!source) return;
  const campaign = clean(params.get('utm_campaign'));
  document.querySelectorAll('a[href^="https://play.google.com/store/apps/details"]').forEach((a) => {
    const url = new URL(a.href);
    const referrer = new URLSearchParams(url.searchParams.get('referrer') || '');
    referrer.set('utm_source', source);
    if (campaign) referrer.set('utm_campaign', campaign);
    url.searchParams.set('referrer', referrer.toString());
    a.href = url.toString();
  });
})();

/* ── Inside another site's frame: a QR code instead of Play ── */
// Ad sites such as FireFaucet show this page in a sandboxed frame. A tab opened from it is sandboxed
// too, and Google Play refuses to load in one (ERR_BLOCKED_BY_RESPONSE). So inside a frame the Play
// buttons open a sheet instead: a QR code to scan with a phone, or on Android a link that opens the
// Play Store app. Both keep the button's utm_source and utm_campaign, with utm_medium "qr" or "app".
(function () {
  let framed;
  try { framed = window.self !== window.top; } catch (e) { framed = true; }
  if (!framed || document.documentElement.classList.contains('embedded')) return;

  const buttons = document.querySelectorAll('a[href^="https://play.google.com/store/apps/details"]');
  if (!buttons.length) return;

  const isAndroid = /Android/i.test(navigator.userAgent);
  let pendingText = null;
  if (!isAndroid) {
    // Fetch the encoder now so the code is ready by the first click.
    const lib = document.createElement('script');
    lib.src = 'assets/vendor/qrcode.min.js';
    lib.addEventListener('load', () => { if (pendingText) drawCode(pendingText); });
    document.head.appendChild(lib);
  }

  const sheet = document.createElement('dialog');
  sheet.className = 'qr-sheet';
  sheet.setAttribute('aria-labelledby', 'qr-title');
  sheet.innerHTML =
    '<div class="qr-card">' +
    '<button type="button" class="qr-close" aria-label="Close">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
    '</button>' +
    '<h2 id="qr-title" class="qr-title">Get ShrinkIt on your phone</h2>' +
    (isAndroid
      ? '<p class="qr-lede">ShrinkIt opens in the Play Store app.</p>' +
        '<a class="btn btn-primary btn-large qr-app">Open in Play Store</a>'
      : '<p class="qr-lede">Scan with your Android phone\'s camera to open ShrinkIt on Google Play.</p>' +
        '<div class="qr-code" role="img" aria-label="QR code that opens ShrinkIt on Google Play"></div>') +
    '<p class="qr-hint">Or search <strong>ShrinkIt</strong> on Google Play.</p>' +
    '</div>';
  document.body.appendChild(sheet);

  const codeBox = sheet.querySelector('.qr-code');
  const appLink = sheet.querySelector('.qr-app');
  let opener = null;

  function playLink(anchor, medium) {
    const url = new URL(anchor.href);
    const referrer = new URLSearchParams(url.searchParams.get('referrer') || '');
    referrer.set('utm_medium', medium);
    url.searchParams.set('referrer', referrer.toString());
    return url;
  }

  function drawCode(text) {
    pendingText = text;
    if (typeof window.qrcode !== 'function') {
      // Still loading (drawn on load) or blocked; the search hint below still helps.
      codeBox.classList.add('qr-code--missing');
      return;
    }
    codeBox.classList.remove('qr-code--missing');
    const qr = window.qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount();
    let d = '';
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (qr.isDark(r, c)) d += 'M' + c + ' ' + r + 'h1v1h-1z';
      }
    }
    // 4-module quiet zone around the code, as the QR spec asks.
    codeBox.innerHTML =
      '<svg viewBox="-4 -4 ' + (n + 8) + ' ' + (n + 8) + '" shape-rendering="crispEdges" aria-hidden="true">' +
      '<rect x="-4" y="-4" width="' + (n + 8) + '" height="' + (n + 8) + '" fill="#fff"/>' +
      '<path d="' + d + '" fill="#0E1019"/></svg>';
  }

  function open(anchor) {
    opener = anchor;
    if (appLink) {
      const url = playLink(anchor, 'app');
      appLink.href = 'market://details' + url.search;
    } else {
      drawCode(playLink(anchor, 'qr').toString());
    }
    if (typeof sheet.showModal === 'function') sheet.showModal();
    else sheet.setAttribute('open', '');
  }

  function close() {
    if (typeof sheet.close === 'function') sheet.close();
    else sheet.removeAttribute('open');
  }

  buttons.forEach((a) => {
    a.setAttribute('aria-haspopup', 'dialog');
    a.addEventListener('click', (e) => {
      e.preventDefault();
      open(a);
    });
  });

  sheet.querySelector('.qr-close').addEventListener('click', close);
  // The card fills the dialog, so a click on the dialog element itself is a click on the backdrop.
  sheet.addEventListener('click', (e) => { if (e.target === sheet) close(); });
  sheet.addEventListener('close', () => { if (opener) opener.focus(); });
})();

/* ── In-app mode (?embed=app; the class is set in <head>) ──── */
// The app shows its own title bar and close button, so the page is read-only there: links become
// plain text, except email links (the app opens a mail app for those), and contents links scroll
// within the page without adding history entries.
(function () {
  if (!document.documentElement.classList.contains('embedded')) return;
  document.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href.length > 1 && href.startsWith('#')) {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(href.slice(1));
        if (target) target.scrollIntoView({ block: 'start' });
      });
    } else if (!href.toLowerCase().startsWith('mailto:')) {
      a.removeAttribute('href');
      a.removeAttribute('target');
    }
  });
})();
