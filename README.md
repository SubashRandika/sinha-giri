# Sigiriya — Journey Through Time

A scroll-driven documentary: scroll position is the age of Sigiriya. The first half travels 2026 → 477 CE, the second returns to the present.

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run images       # rebuild /public plates from /assets-src
npm run films        # re-encode /assets-src/films clips into /public/films
```

## How it works

- **One clock.** `src/lib/time/curve.ts` defines the year curve and what the year implies physically (`standing`, `overgrowth`, strata).
- **One choreography table.** `src/lib/journey/choreography.ts` maps each chapter's local progress + year to the world state (plate, reveal mask, camera, fog, warmth, vegetation, drawing, silhouette).
- **One scroll reader.** `src/lib/journey/controller.ts` runs on `gsap.ticker`: measures chapters with ScrollTrigger, smooths scroll, derives the year, writes `timeState`, and scrubs every chapter's paused GSAP timeline.
- **One world pass.** `src/components/world/` is a single Three.js full-screen shader (dynamically imported) that blends each present-day photo with its reconstruction. `FallbackWorld` covers first paint and no-WebGL devices.
- **Films.** Nine Higgsfield (Kling 3.0) clips, each generated from one of the photographs and upscaled to 1080p with Topaz, are listed in `src/lib/journey/films.ts`. The choreography names a clip per chapter and where the scroll puts its playhead, so scrolling moves the camera and time together. The world canvas downloads clips in journey order and binds each one to the shader in place of its plate, so fog, grain and warmth still apply. Until a clip is ready, its plate stands in (the plate is the clip's first frame). Reduced motion and Save-Data skip video. Clips are encoded at 1080p, 720p and 480p with a keyframe every 4 frames so that seeking stays quick in both directions; the page picks a size from the screen width and pixel density.
- **Chapters** (`src/components/chapters/`) are sticky stages whose DOM timelines are normalised to duration 1.
- **HUD**: the stratigraphic column (depth = age), the year readout, and the evidence chip (photograph / reconstruction / illustration).
- **Sound** is synthesised with Web Audio and built only when the visitor turns it on.

Content and sources live in `src/content/`. Plate alignment calibration is in `src/lib/journey/plates.ts`.

## Before public release

- Confirm licences and credits for the present-day photographs in `assets-src/modern/` (several carry watermarks).
- Set `NEXT_PUBLIC_SITE_URL` for correct Open Graph URLs.
