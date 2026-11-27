# Changelog

## 1.0.4 — 2026-11-27

- **Fixed on Windows (for real this time):** LUNA on Windows sizes the page to the window's outer size, frame and title bar included, so the bottom 39 px and the right 16 px were hidden. The page now leaves that space out on Windows, so the controls at the bottom and the language menu show in full.
- The report adds the outer window size and position, to check this on other set-ups.

## 1.0.3 — 2026-11-26

- **Instruments can be modulated:** the target list now includes the parameters of the
  instrument on an instrument track (it comes first), and of MIDI effects and LUNA's console
  and tape slots, not only the insert effects. Thanks to Matt for reporting it.
- **Fixed for good on Windows:** on some Windows set-ups LUNA lays the page out taller than the
  part of the window you can see, so the bottom buttons stayed hidden even after 1.0.2. The
  page now fits itself to the window size LUNA reports; nothing changes where the two match.
- Plug-ins that do not list their parameters yet (seen with a UAD channel strip on Windows) now
  show every named parameter instead of none.
- The report (Alt-click on the version) now includes the window size LUNA reports, the page's
  size and the screen scaling, to track down cases like this.
- **Report copy:** Alt-click on the version now always says in the status bar that the report was copied. Where the system clipboard is blocked (seen on some Windows set-ups) it uses a fallback, and if that fails too it shows the report selected so you can copy it by hand.

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
