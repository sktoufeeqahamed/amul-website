# Amul Kool Rose — Interactive Scrollytelling Experience

An Apple / Awwwards-grade 60 FPS interactive scrollytelling web experience showcasing **Amul Kool Rose (Gulab Flavoured Chilled Milk)** using a 210-frame high-resolution canvas animation engine, paired with a rich modern product showcase.

---

## ✨ Features

- **210-Frame Canvas Scrollytelling Engine**: Smooth damped linear interpolation (LERP 0.14) for inertia scrubbing on wheel, trackpad, and touch.
- **Top Heading Fade-Away**: "Amul Kool" and "The Taste of India" gracefully float and fade away as the user scrolls past 30% of the sequence.
- **Fixed Transparent Navigation Bar**: Frosted glassmorphism header with active scrollspy indicators and smooth navigation across all sections:
  - *Animation* (`#hero-scroll`)
  - *The Rose Blend* (`#flavor-profile`)
  - *Health Benefits* (`#nutrition-goodness`)
  - *Packs & Pricing* (`#pack-sizes`)
  - *Mocktails* (`#mocktails`)
  - *Reviews* (`#reviews`)
  - *FAQ & Delivery* (`#faq`)
- **Interactive Floating HUD Dock**:
  - Interactive frame scrubber timeline (`001 / 210`).
  - Auto-play / pause toggle with variable speed (0.5x, 1x, 2x).
  - Web Audio ambient rose chiller sound synthesizer.
  - Contain / Cover adaptive aspect ratio toggle & Fullscreen mode.
- **Product Landing Showcase**:
  - Sensory Craftsmanship & Flavor Notes.
  - Lab Certified Nutrition Snapshot (Protein, Calcium, Energy).
  - Cooling Crates & Quick Commerce Partner delivery (Blinkit, Zepto, Swiggy Instamart).
  - Summer Mocktails (Royal Rose Falooda Shake, Sparkling Float, Kulfi Pops).
  - Verified customer reviews & 6-digit postal code delivery checker.

---

## 🚀 Running Locally

No external dependencies needed! Run with native Node.js:

```bash
# Clone the repository
git clone https://github.com/sktoufeeqahamed/amul-website.git
cd amul-website

# Start the local server
npm start
# or: node server.js
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deploying to Vercel

This repository is pre-configured with `vercel.json` for 1-click zero-config Vercel deployment:

1. Import this repository in [Vercel Dashboard](https://vercel.com/new).
2. Framework Preset: **Other** (Static HTML).
3. Root Directory: `./`
4. Click **Deploy**.

The `vercel.json` configuration automatically applies:
- Immutable edge caching (`Cache-Control: public, max-age=31536000, immutable`) for all 210 PNG frames.
- Clean URLs without `.html` extensions.
- Security headers (nosniff, XSS protection, frame options).

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| <kbd>Space</kbd> | Toggle Auto-Play / Pause |
| <kbd>↓</kbd> / <kbd>→</kbd> | Step Forward |
| <kbd>↑</kbd> / <kbd>←</kbd> | Step Backward |
| <kbd>Home</kbd> | Rewind to Frame 1 |
| <kbd>End</kbd> | Jump to Final Frame |
| <kbd>F</kbd> | Toggle Fullscreen |
| <kbd>M</kbd> | Toggle Ambient Audio Chiller |

---

&copy; 2026 Gujarat Cooperative Milk Marketing Federation Ltd. (Amul).
