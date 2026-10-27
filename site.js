'use strict';
// The direct Windows installer. Leave url empty to show only the Microsoft Store option.
const DIRECT = {
  url: 'https://github.com/connortracy020-oss/lecture-desk/releases/download/v0.5.1/Lecture-Desk-0.5.1-Setup.exe',
  version: '0.5.1',
  sizeMB: 585,
  sha256: '42d7f88ebd153cc8c05f1fde8f86e672357ac0951972088a2688bdb6c051af9f'
};

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Direct download details appear only once the installer is published.
if (DIRECT.url) {
  for (const el of document.querySelectorAll('[data-direct-only]')) el.hidden = false;
  for (const a of document.querySelectorAll('[data-direct-link]')) a.href = DIRECT.url;
  const hero = document.querySelector('.cta-row [data-direct-only]');
  if (hero) hero.href = '#download';
  const meta = document.querySelector('[data-direct-meta]');
  if (meta) meta.textContent = `Version ${DIRECT.version}${DIRECT.sizeMB ? ` · ${DIRECT.sizeMB} MB` : ''} · Windows 10 and 11, 64-bit`;
  const hash = document.querySelector('[data-direct-hash]');
  if (hash) hash.textContent = DIRECT.sha256 ? 'SHA-256: ' + DIRECT.sha256 : '';
}

// Navigation gets a hairline once the page scrolls.
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// Sections fade up as they arrive.
const reveal = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('in'); reveal.unobserve(entry.target); }
}, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
// The hero is the first thing anyone sees, so it never waits for a fade.
document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('in', 'instant'));
document.querySelectorAll('.reveal:not(.instant)').forEach((el, i) => { el.style.transitionDelay = `${Math.min(i % 4, 3) * 60}ms`; reveal.observe(el); });

// Feature showcase: one clip at a time, playing only while visible, then the next.
const showcase = document.querySelector('.showcase');
if (showcase) {
  const tabs = [...showcase.querySelectorAll('[role="tab"]')];
  const video = showcase.querySelector('video'), bar = showcase.querySelector('.progress span'), copy = showcase.querySelector('.stage-copy');
  let index = 0, visible = false, userPaused = false;
  const select = (next, play = true) => {
    index = (next + tabs.length) % tabs.length;
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
    const tab = tabs[index], name = tab.dataset.clip;
    copy.textContent = tab.dataset.copy;
    video.setAttribute('aria-label', 'Lecture Desk: ' + tab.textContent.replace(/^\d+/, '').trim());
    video.poster = `media/${name}.jpg`;
    video.querySelector('source').src = `media/${name}.mp4`;
    video.load(); bar.style.width = '0';
    if (play && visible && !reduced && !userPaused) video.play().catch(() => {});
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => { userPaused = false; select(i); });
    tab.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; tabs[next].focus(); userPaused = false; select(next); }
    });
  });
  tabs.forEach((tab, i) => { tab.tabIndex = i === 0 ? 0 : -1; });
  video.addEventListener('timeupdate', () => { if (video.duration) bar.style.width = (video.currentTime / video.duration * 100) + '%'; });
  video.addEventListener('ended', () => select(index + 1));
  // With reduced motion, clips play only when asked: click the video to play or pause.
  video.addEventListener('click', () => { if (video.paused) { userPaused = false; video.play().catch(() => {}); } else { userPaused = true; video.pause(); } });
  video.style.cursor = 'pointer';
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !reduced && !userPaused) video.play().catch(() => {}); else video.pause();
  }, { threshold: .35 }).observe(video);
}

// The 30-second tour, with sound, in a dialog.
const dialog = document.querySelector('.tour-dialog');
if (dialog) {
  const tourVideo = dialog.querySelector('video');
  for (const button of document.querySelectorAll('[data-open-tour]')) {
    button.addEventListener('click', () => { if (typeof dialog.showModal === 'function') { dialog.showModal(); tourVideo.play().catch(() => {}); } else location.href = 'media/tour.mp4'; });
  }
  dialog.addEventListener('close', () => tourVideo.pause());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
}
