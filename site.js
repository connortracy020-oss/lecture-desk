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

// The demo plays only while it's on screen. With reduced motion it waits for a click.
const demo = document.querySelector('.demo');
if (demo) {
  const video = demo.querySelector('video'), button = demo.querySelector('.play');
  let chosenPause = false, visible = false;
  const sync = () => {
    const paused = video.paused;
    button.classList.toggle('paused', paused);
    button.setAttribute('aria-label', paused ? 'Play the demo' : 'Pause the demo');
  };
  const toggle = () => { if (video.paused) { chosenPause = false; video.play().catch(() => {}); } else { chosenPause = true; video.pause(); } };
  button.hidden = false; button.addEventListener('click', toggle); video.addEventListener('click', toggle);
  video.addEventListener('play', sync); video.addEventListener('pause', sync); sync();
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !chosenPause && !reduced.matches) { video.preload = 'auto'; video.play().catch(() => {}); }
    else if (!visible) video.pause();
  }, { threshold: .4 }).observe(video);
}
