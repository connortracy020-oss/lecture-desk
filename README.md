# Lecture Desk website

The download page for [Lecture Desk](https://connortracy020-oss.github.io/lecture-desk/), a free Windows app that records lectures and turns them into study notes with AI that runs on your own laptop.

- `index.html`, `styles.css`, `site.js`: the page. Plain HTML, CSS and JavaScript with no build step.
- `privacy.html`: generated from the privacy notice shipped in the app (`node build-privacy.cjs <PRIVACY.md>`), with the Mac differences from `privacy-mac.md` added before the contact section.
- After changing `styles.css` or `site.js`, bump the `?v=` on their links in `index.html` (and set `ASSET_VERSION` when rebuilding `privacy.html`) so browsers fetch the new copy instead of a cached one.
- `media/launch.mp4`: the full 94-second launch video (1600 px, 30 fps) that plays in the hero. `img/`: icons and the share image.
- The Windows installer is attached to each [release](https://github.com/connortracy020-oss/lecture-desk/releases). To publish a new version, attach the new installer to a release, then update `DIRECT` at the top of `site.js`. The Mac DMG goes on the same release; its link, size and SHA-256 are written in the Mac card in `index.html`.
