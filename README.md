# ShrinkIt — Official Website

GitHub Pages companion website for the **ShrinkIt** Android app (`com.sprintapps.shrinkit`).

Serves as:
- Google Play developer website
- AdMob `app-ads.txt` verification endpoint
- Privacy Policy hosting
- Terms of Service hosting
- Marketing landing page

---

## File Structure

```
shrinkit-website/
├── index.html              # Landing page
├── privacy-policy.html     # Privacy Policy (Play Store compliant)
├── terms-of-service.html   # Terms of Service (Pro, ads/rewards, Unlock PDF, presets)
├── app-ads.txt             # AdMob verification (publisher pub-7995936388116429)
├── .nojekyll               # Disables Jekyll processing on GitHub Pages
├── README.md               # This file
└── assets/
    ├── style.css           # All styles, shared by every page (design system below)
    ├── main.js             # Nav hairline, hero squeeze, tools tabs, in-app mode
    ├── fonts/
    │   ├── roboto-flex-display.woff2  # Display font, self-hosted (see "Display font")
    │   └── OFL.txt         # Roboto Flex licence (SIL OFL 1.1)
    ├── screens/            # Real app captures, WebP, 360 and 720 px wide
    ├── icon-512.png        # App icon (apple-touch-icon)
    └── og-image.png        # Social-share image, 1200×630 (see below)
```

---

## Deploying to GitHub Pages

### First-time setup

1. Push this directory to a GitHub repository (e.g., `shrinkit-website`).
2. Go to **Settings → Pages** in that repository.
3. Under **Source**, select **Deploy from a branch**.
4. Choose `main` branch, `/ (root)` folder. Click **Save**.
5. GitHub Pages will publish at `https://YOUR_USERNAME.github.io/shrinkit-website/`.

### Update the canonical URL

Replace `YOUR_GITHUB_USERNAME` in these two files with your actual GitHub username:

- `index.html` — lines with `og:url`, `twitter:image`, `<link rel="canonical">`, and JSON-LD `url`/`screenshot`
- `privacy-policy.html` — `<link rel="canonical">` and `og:url`

### Custom domain (optional)

1. In the repo root, create a file named `CNAME` containing your domain (e.g., `shrinkit.app`).
2. Configure your DNS provider to point to GitHub Pages (see [GitHub docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)).
3. Update all canonical URLs and OG/Twitter image URLs in both HTML files to use your custom domain.

---

## Setting the Play Store link

The Google Play URL `https://play.google.com/store/apps/details?id=com.sprintapps.shrinkit` is used throughout. Once your app is published, this URL is live. Search for `play.google.com/store/apps` in both HTML files to find every occurrence.

---

## Screenshots

`assets/screens/` holds real captures of the app (1.5.0, Pixel 6 Pro AVD, dark theme), the same
raws as the Play screenshots: the app repo's `brand/playstore/studio/public/screenshots/android/phone/en/`
(gitignored there) and Google Drive `ShrinkIt_screenshots/raw/phone/` (the photo before/after).
Each is the top 2760 px of a 1440×3120 capture (Home keeps all 3120), which drops the test-ad
banner and the "Stay in the loop" bar, saved as WebP q82 at 360 and 720 px wide:

| File | Raw capture |
|------|-------------|
| `home` | `01_home.png` |
| `video` | `02_video_compress.png` |
| `photo` | `03_photo_before_after.png` (Drive) |
| `batch` | `04_batch_done.png` |
| `pdf` | `06_pdf_result.png` |
| `unlock` | `09_unlock_pdf.png` |
| `forms` | `07_form_presets.png` |
| `convert` | `08_convert.png` |

```bash
cwebp -q 82 -m 6 -crop 0 0 1440 2760 -resize 720 0 capture.png -o assets/screens/name-720.webp
cwebp -q 82 -m 6 -crop 0 0 1440 2760 -resize 360 0 capture.png -o assets/screens/name-360.webp
```

The sizes in the homepage's "Real files" strip come from these same result screens. If you swap a
capture, update the numbers and the image's alt text with it.

### Open Graph image

`assets/og-image.png` (1200×630) is rendered from `brand/og_image_source.html` in the ShrinkIt app
repo, a copy of the Play feature-graphic template. Render it with any headless Chrome:

```bash
chrome-headless-shell --headless --hide-scrollbars --window-size=1024,538 \
  --force-device-scale-factor=1.171875 --screenshot=og-image.png og_image_source.html
```

If the size changes, update `og:image:width` / `og:image:height` in `index.html`.

---

## Design System

The site follows the app's own design system (`DESIGN.md` in the app repo): calm and spacious,
one brand colour, and accents that always mean the same thing.

### Colours
CSS custom properties in `assets/style.css` under `:root`, matching
`app/src/main/java/com/sprintapps/shrinkit/core/ui/theme/Color.kt`:
- `--paper` `#F8F8FF` background, `--raised` `#FFFFFF` panels, `--well` `#F3F3FC`
- `--ink` `#1A1B27`, `--ink-2` `#45464F`, `--ink-3` `#5D5F6C` (all ≥ 4.5:1 on paper)
- `--cobalt` `#1558D6`: actions and links. Feature accents keep the app's meanings: cobalt =
  images, teal `#0D9488` = documents, amber `#D97706` = video, batch and Unlock PDF.
- `--navy` `#0E1019`: the privacy band and phone bezels (the app's dark theme).
- `--grad-pro` (cobalt → `#0F766E`): **Pro only** (the pricing table's Pro column and the Pro
  mark), as in the app.

### Type
- **Display**: Roboto Flex (the variable version of the app's Roboto) for big headings, the
  result sizes and the wordmark. Its width axis is the site's one bold move: wide type is
  "before", condensed type is "after". The hero's "Made small." squeezes once on load (main.js,
  `.squeeze`), only after the font has loaded and never with reduced motion.
- **Body**: the system font (`system-ui`), which is Roboto on Android, like the app.

### Display font
`assets/fonts/roboto-flex-display.woff2` (77 KB) is an instance of Roboto Flex with the optical
size pinned at 144 (the condensed and extended extremes only exist at display sizes), weight
300–900, width 25–151, Latin only. Self-hosting it means the site makes no third-party font
requests. To rebuild it (fontTools + brotli):

```bash
# rf-latin.woff2 = the Latin file Google Fonts serves for
# Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000
python - <<'PY'
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
f = instancer.instantiateVariableFont(TTFont('rf-latin.woff2'),
        {'opsz': 144, 'wght': (300, 900), 'wdth': (25, 151)})
f.flavor = 'woff2'; f.save('rf-144.woff2')
PY
pyftsubset rf-144.woff2 --flavor=woff2 --output-file=assets/fonts/roboto-flex-display.woff2 \
  --unicodes="U+0020-007E,U+00A0-00FF,U+2010-2027,U+2030-2039,U+20B9,U+2190-2193,U+2122" \
  --layout-features='kern,liga,calt,tnum,lnum,case'
```

### Logo
The logo is an inline SVG reproduced from the Android vector drawables
(`ic_launcher_foreground.xml`, four white chevrons and a centre circle, on the
`ic_launcher_background.xml` gradient `#2268E8 → #003A8F`). It appears in the nav, the closing
card and the footer. The wordmark is "Shrink" in ink and "It" in cobalt (`<em>`), as in the app.

### Homepage structure
Hero (squeeze headline + Home capture) → real results → tools (tabs with JavaScript, a plain
column without; `#video`, `#photos`, `#batch`, `#pdf`, `#unlock-pdf`, `#form-photos`, `#convert`
open that tab) → also in the app → privacy → Free vs Pro table → FAQ (`<details>`) → closing.
New features go in as a new tool tab or an "Also in ShrinkIt" item, not as a separate section.

---

## Updating app-ads.txt

The `app-ads.txt` file is already configured with the correct publisher ID:

```
google.com, pub-7995936388116429, DIRECT, f08c47fec0942fa0
```

If you add additional ad networks, append one entry per line following the IAB format:
```
networkdomain.com, PUBLISHER_ID, DIRECT_or_RESELLER, TAG_ID
```

To verify: visit `https://YOUR_DOMAIN/app-ads.txt` — Google Ads crawlers check this URL automatically.

---

## Updating the Privacy Policy

The privacy policy in `privacy-policy.html` is derived from:
- `app/src/main/AndroidManifest.xml` — permissions
- Firebase BOM version `33.9.0` — Crashlytics + Remote Config
- AdMob publisher ID `pub-7995936388116429`
- `app/src/main/java/.../BillingManager.kt` — Google Play Billing (product: `shrinkit_pro`)

If you add new permissions, SDKs, or data collection, update Section 4 and Section 5 in `privacy-policy.html` and update the "Last updated" date at the top.

---

## Local Preview

No build tools required. Open `index.html` directly in a browser, or use any static file server:

```bash
# Python 3
python3 -m http.server 8080

# Node.js (npx)
npx serve .
```

Then open `http://localhost:8080`.
