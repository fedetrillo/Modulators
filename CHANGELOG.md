# Changelog

## 1.0.2 — 2026-11-25

- **Fixed:** on some Windows set-ups the buttons at the bottom (Undo, Clear, Write automation)
  were pushed out of the window. They now always stay in view; if the window is small, the
  middle scrolls instead.
- **Stepped parameters are flagged:** when the target is a switch or a stepped plug-in control
  (like a Pultec's frequency selector), a note says how many positions it has, so the curve
  jumping between them is no surprise.

## 1.0.1 — 2026-11-25

- A short getting-started guide: the first time it opens it asks for your language, then walks
  you through the window in it. The **Guide** button brings it back.

## 1.0.0 — 2026-11-24

- First release: tempo-synced LFOs and shapes written as automation on the selected track.
- Targets: volume, pan (stereo pan keeping the width, or left and right on their own), mute,
  sends and every parameter of the plug-ins on the track's inserts, in a folding, searchable list
  that refreshes by itself when you add or remove plug-ins.
- Eight shapes (sine, triangle, square, ramp up, ramp down, random, S&H, pump), rates from
  4 bars to 1/32 in straight, triplet and dotted feel, minimum, maximum, phase and smoothing,
  and Surprise me.
- Writes over the selection or loop, or 1, 2, 4 or 8 bars from the cursor. Stepped parameters
  and mute get clean jumps.
- Modulated parameters stay in view at the top of the list, coloured by kind (mixer, sends,
  plug-ins); the existing automation is drawn behind the new curve.
- Clear in range and Undo.
- Dark and grey themes, 7 languages, Alt-click the version for a support report.
