# Karaoke Words Favicon Design

## Goal

Replace the default Astro favicon with a compact mark that is specific to the English reader app. The mark should communicate read-along audio without using generic headphones, microphones, waveforms, or podcast symbols.

## Selected Direction

The selected concept is **Karaoke Words**: a short reading rail beside two rows of word-shaped pills. Amber pills represent words that have been read; rust pills represent words still ahead.

This direction follows the app's existing color grammar:

- rust is the brand and navigation color;
- amber is reserved for audio, playback, and the active reading trail;
- warm paper is the reading surface.

## Geometry

Use one SVG with `viewBox="0 0 128 128"`. The mark has no strokes, text, gradients, filters, masks, or font dependencies.

| Element | Geometry | Color role |
| --- | --- | --- |
| Background tile | `x=8 y=8 width=112 height=112 rx=24` | paper |
| Reading rail | `x=24 y=29 width=9 height=70 rx=4.5` | brand |
| Top word 1 | `x=44 y=34 width=18 height=14 rx=7` | audio/read |
| Top word 2 | `x=70 y=34 width=14 height=14 rx=7` | audio/read |
| Top word 3 | `x=92 y=34 width=20 height=14 rx=7` | brand/ahead |
| Bottom word 1 | `x=44 y=72 width=30 height=14 rx=7` | audio/read |
| Bottom word 2 | `x=82 y=72 width=28 height=14 rx=7` | brand/ahead |

The separated pills must not be joined into full lines. Their gaps are what distinguish the mark from a menu, document list, or geometric letter E.

## Colors

The SVG supports the browser's preferred color scheme.

| Role | Light | Dark |
| --- | --- | --- |
| paper | `#F7F3EA` | `#1B1916` |
| brand | `#9A3B12` | `#E2875A` |
| audio/read | `#F59E0B` | `#FBBF24` |

The `.ico` fallback uses the light palette because ICO does not reliably support color-scheme switching.

## Size Behavior

- **128 px:** preserve the rounded paper tile and pill terminals.
- **32 px:** render directly from the SVG geometry; all important marks remain at least 2–3 physical pixels thick.
- **16 px:** use a dedicated raster export. Pixel-align the reading rail to 1 px, the pill height to 2 px, and keep at least 1 px between neighboring pills.

At 16 px, the required signal is a vertical rail plus five distinct word blocks with an amber-to-rust reading progression. Fine rounding may be reduced if it makes the blocks blurry.

## Deliverables

- Replace `app/public/favicon.svg` with the responsive SVG.
- Regenerate `app/public/favicon.ico` with at least 16 px and 32 px embedded sizes.
- Add explicit favicon links in the shared layout so browsers prefer SVG and retain ICO as fallback.

No navigation logo, PWA manifest, home-screen icon, animation, or broader brand system is included.

## Verification

1. Render the SVG at 16, 32, and 128 px on both light and dark browser chrome.
2. Confirm all five word pills remain visually separate at 16 px.
3. Confirm the mark does not read primarily as an E, hamburger menu, or equalizer.
4. Build the Astro app and verify the homepage and lesson pages request the intended favicon assets without errors.
5. Open the built app in the browser and verify both the SVG path and ICO fallback are valid.
