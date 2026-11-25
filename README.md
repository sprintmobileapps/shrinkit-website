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
    ├── style.css           # All styles (design system from app Color.kt)
    ├── main.js             # Nav scroll, canvas animation, FAQ accordion, campaign tags, QR sheet
    ├── vendor/qrcode.min.js  # qrcode-generator 1.4.4 (MIT), loaded only inside other sites' frames
    ├── screens/            # Real app captures for the "See it in action" gallery (WebP)
    ├── icon-512.png        # App icon
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

### Campaign links

Each Play button on the homepage carries an install referrer: `utm_source=website`, `utm_medium` = the button
(`nav`, `hero`, `cta`, `footer`), `utm_campaign=site`. For a paid placement, link to the site with its own source,
e.g. `https://sprintmobileapps.github.io/shrinkit-website/?utm_source=firefaucet` (optionally `&utm_campaign=…`);
`main.js` swaps that source into every button.

### Inside another site's frame (ad networks)

Sites such as FireFaucet show the page in a sandboxed iframe. Tabs opened from it inherit the sandbox, and Google
Play refuses to load in a sandboxed tab (`ERR_BLOCKED_BY_RESPONSE`, from Play's Cross-Origin-Opener-Policy). So
when the page is framed, the Play buttons open a sheet instead: a QR code on computers (`utm_medium=qr`) and an
"Open in Play Store" `market://` link on Android (`utm_medium=app`). Ordinary visits are unchanged and never load
the QR encoder. To regenerate `assets/vendor/qrcode.min.js`: `npm pack qrcode-generator@1.4.4`, then minify
`package/qrcode.js` with esbuild and keep the license line at the top.

---

## Screenshots ("See it in action")

The gallery under the stats bar shows six real captures of the app (1.5.0, Pixel 6 Pro AVD, dark
theme), the same raws as the Play screenshots. They live in the app repo at
`brand/playstore/studio/public/screenshots/android/phone/en/` (gitignored there; copies on Google
Drive in `ShrinkIt_screenshots`). Each is the top 2760 px of a 1440×3120 capture, which drops the
test-ad banner and the "Stay in the loop" bar, saved as WebP q82 at 360 and 720 px wide:

| File | Raw capture |
|------|-------------|
| `home` | `01_home.png` |
| `video` | `02_video_compress.png` |
| `batch` | `04_batch_done.png` |
| `pdf` | `06_pdf_result.png` |
| `unlock` | `09_unlock_pdf.png` |
| `forms` | `07_form_presets.png` |

```bash
cwebp -q 82 -m 6 -crop 0 0 1440 2760 -resize 720 0 capture.png -o assets/screens/name-720.webp
cwebp -q 82 -m 6 -crop 0 0 1440 2760 -resize 360 0 capture.png -o assets/screens/name-360.webp
```

The sizes in the captions (30.24 MB saved, 14.57 MB → 4.22 MB) come from these screens. If you
swap a capture, update its caption and alt text too. The features grid has 12 cards (a full 3×4
grid); when adding one, add or merge another so the last row stays full.

### Open Graph image

`assets/og-image.png` (1200×630) is rendered from `brand/og_image_source.html` in the ShrinkIt app
repo, a copy of the Play feature-graphic template. Render it with any headless Chrome:

```bash
chrome-headless-shell --headless --hide-scrollbars --window-size=1024,538 \
  --force-device-scale-factor=1.171875 --screenshot=og-image.png og_image_source.html
```

If the size changes, update `og:image:width` / `og:image:height` in `index.html`.

---

## Updating Branding

### Colors
All brand colors are defined as CSS custom properties in `assets/style.css` under `:root`. They match exactly the values in `app/src/main/java/com/sprintapps/shrinkit/core/ui/theme/Color.kt`:
- `--cobalt`: `#1558D6` (primary brand blue)
- `--teal`: `#0D9488` (tertiary / document accent)
- `--dark-bg`: `#0E1019` (hero and footer background)

### Logo
The logo is an inline SVG reproduced from the actual Android vector drawables:
- `app/src/main/res/drawable/ic_launcher_foreground.xml` — four white chevrons + center circle
- `ic_launcher_background.xml` — cobalt gradient `#2268E8 → #003A8F`

To update the logo, edit the SVG paths in `index.html` and `privacy-policy.html`. The logo SVG appears in three places per page: nav, hero, and footer.

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

---

## Design System

Typography: **Barlow Condensed** (display, ExtraBold 800) + **Inter** (body, 400/500/600)  
Loaded from Google Fonts — two font families, two requests total.

The canvas particle animation in the hero (`assets/main.js`) automatically pauses when the tab is hidden and respects `prefers-reduced-motion`.
