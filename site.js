'use strict';
// The direct Windows installer. Leave url empty to show only the Microsoft Store option.
const DIRECT = {
  url: 'https://github.com/connortracy020-oss/lecture-desk/releases/download/v0.5.1/Lecture-Desk-0.5.1-Setup.exe',
  version: '0.5.1',
  sizeMB: 585,
  sha256: '42d7f88ebd153cc8c05f1fde8f86e672357ac0951972088a2688bdb6c051af9f'
};

document.documentElement.classList.add('js');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

if (DIRECT.url) {
  for (const el of document.querySelectorAll('[data-direct-only]')) el.hidden = false;
  for (const a of document.querySelectorAll('[data-direct-link]')) a.href = DIRECT.url;
  const meta = document.querySelector('[data-direct-meta]');
  if (meta) meta.textContent = `Version ${DIRECT.version} · ${DIRECT.sizeMB} MB · Windows 10 and 11, 64-bit`;
  const hash = document.querySelector('[data-direct-hash]');
  if (hash) hash.textContent = DIRECT.sha256;
}

// On a Mac, a link straight to Privacy & Security for the one-time Open Anyway step.
// iPads also say Macintosh, so touch screens are left out.
if (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints < 2) {
  for (const el of document.querySelectorAll('[data-mac-settings]')) el.hidden = false;
}

// A hairline under the navigation once the page moves.
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > 4);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// Sections fade in once as they arrive.
const fades = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('in'); fades.unobserve(entry.target); }
}, { rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('.fade').forEach(el => fades.observe(el));

// Notes that show their work: choosing a note lights up the line of the lecture it came from.
const proof = document.querySelector('[data-proof]');
if (proof) {
  const notes = [...proof.querySelectorAll('button[data-line]')];
  for (const note of notes) {
    note.addEventListener('click', () => {
      for (const other of notes) other.setAttribute('aria-pressed', String(other === note));
      for (const line of proof.querySelectorAll('.proof-transcript li')) line.classList.toggle('lit', line.id === note.dataset.line);
    });
  }
}

// The launch video plays muted once it has been scrolled into view. With reduced motion it waits for a click.
// Turning the sound on starts it from the beginning, since that's when someone means to watch it.
const film = document.querySelector('[data-film]');
if (film) {
  const video = film.querySelector('video'), controls = film.querySelector('.film-controls');
  const play = film.querySelector('.film-play'), sound = film.querySelector('.film-sound');
  let chosenPause = false;
  const sync = () => {
    play.classList.toggle('paused', video.paused);
    play.setAttribute('aria-label', video.paused ? 'Play the video' : 'Pause the video');
    sound.setAttribute('aria-pressed', String(!video.muted));
    sound.querySelector('span').textContent = video.muted ? 'Sound on' : 'Sound off';
  };
  const toggle = () => { if (video.paused) { chosenPause = false; video.play().catch(() => {}); } else { chosenPause = true; video.pause(); } };
  controls.hidden = false;
  play.addEventListener('click', toggle); video.addEventListener('click', toggle);
  sound.addEventListener('click', () => {
    if (video.muted) { video.muted = false; video.currentTime = 0; chosenPause = false; video.play().catch(() => {}); }
    else video.muted = true;
    sync();
  });
  for (const event of ['play', 'pause', 'volumechange']) video.addEventListener(event, sync);
  sync();
  // It waits until the visitor has scrolled to it, even on a screen tall enough to show it on load.
  let inView = false, scrolled = scrollY > 0;
  const autoplay = () => {
    if (inView && scrolled && !chosenPause && !reduced.matches) video.play().catch(() => {});
    else if (!inView) video.pause();
  };
  addEventListener('scroll', () => { if (!scrolled) { scrolled = true; autoplay(); } }, { passive: true });
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; autoplay(); }, { threshold: .6 }).observe(video);
}
