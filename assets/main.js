/* ShrinkIt website — main.js (shared by the homepage and the legal pages) */

/* ── Nav: hairline once the page scrolls ───────────────────── */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const toggle = () => nav.classList.toggle('nav--scrolled', window.scrollY > 8);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
})();

/* ── Hero headline: the one-time squeeze ───────────────────── */
// "Made small." starts as wide as "Big files." and squeezes once, only after the display font
// (Roboto Flex) has loaded: the fallback font has no width axis, so the moment would be lost.
// If the font is slow, or motion is reduced, the headline simply shows its final state.
(function () {
  const h = document.querySelector('.squeeze');
  if (!h) return;
  const done = () => h.classList.add('is-done');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !document.fonts || !document.fonts.load) { done(); return; }

  const giveUp = setTimeout(done, 1500);
  document.fonts.load('820 64px "ShrinkIt Display"').then((faces) => {
    clearTimeout(giveUp);
    if (h.classList.contains('is-done') || !faces.length) { done(); return; }
    h.classList.add('is-squeezing');
    h.addEventListener('animationend', () => {
      h.classList.remove('is-squeezing');
      done();
    }, { once: true });
  }).catch(done);
})();

/* ── Tools tour: tabs ──────────────────────────────────────── */
// Without JavaScript every tool is shown in a column. With it, the tools become tabs (ARIA tabs
// pattern, automatic activation). A link to a tool's id (e.g. #unlock-pdf) opens that tab.
(function () {
  const tour = document.querySelector('[data-tour]');
  if (!tour) return;
  const tablist = tour.querySelector('[data-tablist]');
  const tabs = Array.from(tablist.querySelectorAll('button'));
  const panels = tabs.map((t) => document.getElementById(t.dataset.panel));
  if (panels.some((p) => !p)) return;

  tablist.hidden = false;
  tablist.setAttribute('role', 'tablist');
  tour.classList.add('js-tour');

  tabs.forEach((tab, i) => {
    const panel = panels[i];
    tab.id = 'tab-' + panel.id;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
  });

  function select(index, focus) {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
    });
    if (focus) tabs[index].focus();
  }

  tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i, false)));

  tablist.addEventListener('keydown', (e) => {
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (current + 1) % tabs.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (current - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    select(next, true);
  });

  function fromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    const i = panels.findIndex((p) => p.id === id);
    if (i < 0) return false;
    select(i, false);
    tour.scrollIntoView({ block: 'start' });
    return true;
  }

  window.addEventListener('hashchange', fromHash);
  if (!fromHash()) select(0, false);
})();

/* ── Footer year ───────────────────────────────────────────── */
(function () {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
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
