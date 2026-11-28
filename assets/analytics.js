/* ShrinkIt Website — analytics.js */

/* ── Visits and Play button clicks (Google Analytics 4) ────── */
// Data goes to its own Google Analytics 4 property ("ShrinkIt website"), kept apart from the app's Firebase
// property so web visitors never mix into the app's user counts. Only gtag.js loads, with the measurement ID below. That
// ID is public by design (every page that uses Google Analytics carries one). There is no API key or other
// secret here, and none belongs in this repo.
//
// Logs:
// - page_view (automatic). Google Analytics reads utm_source/utm_medium/utm_campaign from the page URL,
//   or the referring site, as the session's source.
// - play_store_click on every Play button: button (nav, hero, cta, footer, sheet), method (link, app,
//   qr, app_retry), visit_source (utm_source, else the referring site, else "direct"), visit_campaign.
//   Named visit_* because Google Analytics already has built-in source and campaign dimensions. A method
//   other than "link" means the page was inside another site's frame.
//
// Off inside the app's own viewer (?embed=app), on local previews, and for visitors whose browser sends
// Global Privacy Control. Add ?ga_debug=1 to a live URL to watch the events in Google Analytics DebugView.
(function () {
  var MEASUREMENT_ID = 'G-92RVXNQV5N';
  var LIVE_HOST = 'sprintmobileapps.github.io';

  if (document.documentElement.classList.contains('embedded')) return;
  if (window.location.hostname !== LIVE_HOST) return;
  if (navigator.globalPrivacyControl === true) return;

  var params = new URLSearchParams(window.location.search);
  // Same cleaning as the campaign tags in main.js, so both name a source the same way.
  var clean = function (v) { return (v || '').toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 40); };

  var framed;
  try { framed = window.self !== window.top; } catch (e) { framed = true; }
  // Framed by another site (an ad site's timer page). Reading the top page's address throws then.
  var foreignFrame = false;
  if (framed) {
    try { foreignFrame = window.top.location.hostname !== LIVE_HOST; } catch (e) { foreignFrame = true; }
  }
  var isAndroid = /Android/i.test(navigator.userAgent);

  // Where this visit came from. Kept for the tab's session, so a click on a later page (privacy policy,
  // terms) still names the site or campaign that brought the visitor, not this site.
  var landing = { source: clean(params.get('utm_source')), campaign: clean(params.get('utm_campaign')) };
  if (!landing.source && document.referrer) {
    try {
      var host = new URL(document.referrer).hostname.replace(/^www\./, '');
      if (host && host !== LIVE_HOST) landing.source = clean(host);
    } catch (e) { /* unreadable referrer: treat as direct */ }
  }
  try {
    var stored = JSON.parse(window.sessionStorage.getItem('shrinkit_landing') || 'null');
    if (!landing.source && stored && stored.source) landing = stored;
    else if (landing.source) window.sessionStorage.setItem('shrinkit_landing', JSON.stringify(landing));
  } catch (e) { /* storage blocked (private mode, sandboxed frame): this page's own source only */ }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  // No ad features at all. Analytics cookies are off in the EEA, the UK and Switzerland, where they need
  // consent this site doesn't ask for; those visits are counted without cookies.
  // Also off inside another site's frame: there gtag.js sends nothing at all while cookies are allowed
  // (it won't set its cookie in a third-party frame, even with SameSite=None or a fixed client_id; tested
  // in Chromium 2026-11-26), but it does send cookieless hits. Those count as a new visitor per page.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: foreignFrame ? 'denied' : 'granted'
  });
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    region: ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV',
      'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH']
  });
  gtag('js', new Date());

  var config = {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  };
  // debug_mode: false still turns debug on, so the key is only set when wanted.
  if (params.get('ga_debug') === '1') config.debug_mode = true;
  gtag('config', MEASUREMENT_ID, config);

  var lib = document.createElement('script');
  lib.async = true;
  lib.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
  document.head.appendChild(lib);

  // Capture phase: runs before main.js's handlers on framed pages, which navigate to the Play Store app
  // or open the QR sheet. The hit goes out with sendBeacon, so leaving the page doesn't drop it.
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var retry = a.classList.contains('qr-app');
    if (!retry && a.href.indexOf('https://play.google.com/store/apps/details') !== 0) return;

    var button = 'page';
    if (retry) {
      button = 'sheet';
    } else {
      try {
        var tags = new URLSearchParams(new URL(a.href).searchParams.get('referrer') || '');
        button = clean(tags.get('utm_medium'));
      } catch (err) { button = ''; }
      if (!button) button = a.closest('nav') ? 'nav' : a.closest('footer') ? 'footer' : 'page';
    }

    gtag('event', 'play_store_click', {
      button: button,
      method: retry ? 'app_retry' : !framed ? 'link' : isAndroid ? 'app' : 'qr',
      visit_source: landing.source || 'direct',
      visit_campaign: landing.campaign || '',
      link_url: a.href
    });
  }, true);
})();
