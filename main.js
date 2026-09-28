// Intro file: replace video/intro.mp4 with your final MP4, keeping this path.
const intro = document.getElementById('intro');
const introVideo = document.getElementById('intro-video');
const main = document.getElementById('main');
const header = document.querySelector('.site-header');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let introFinished = false;
let introStarted = false;
let introTimeout;

function finishIntro() {
  if (introFinished) return;
  introFinished = true;
  clearTimeout(introTimeout);
  introVideo.pause();
  main.inert = false;
  header.inert = false;
  document.documentElement.classList.remove('intro-checking');
  intro.classList.add('is-leaving');
  document.body.classList.remove('intro-active');
  window.setTimeout(() => { intro.hidden = true; intro.classList.remove('is-leaving'); }, reduceMotion.matches ? 0 : 550);
}

function startIntro() {
  if (introFinished || introStarted || reduceMotion.matches) return;
  introStarted = true;
  clearTimeout(introTimeout);
  intro.hidden = false;
  intro.classList.remove('is-loading');
  document.body.classList.add('intro-active');
  main.inert = true;
  header.inert = true;
  document.documentElement.classList.remove('intro-checking');
  introVideo.muted = true;
  const playAttempt = introVideo.play();
  if (playAttempt && typeof playAttempt.catch === 'function') playAttempt.catch(finishIntro);
}

introVideo.addEventListener('ended', finishIntro);
introVideo.addEventListener('error', finishIntro);
introVideo.addEventListener('canplay', startIntro, { once: true });
introVideo.addEventListener('loadeddata', startIntro, { once: true });
introTimeout = window.setTimeout(finishIntro, 1800);
if (reduceMotion.matches) finishIntro();
else {
  intro.hidden = false;
  intro.classList.add('is-loading');
  document.body.classList.add('intro-active');
  main.inert = true;
  header.inert = true;
  introVideo.load();
  if (introVideo.readyState >= 2) startIntro();
}

const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
function closeNav() { navToggle.setAttribute('aria-expanded','false'); navToggle.setAttribute('aria-label','Open navigation'); navLinks.classList.remove('is-open'); }
navToggle.addEventListener('click', () => { const open = navToggle.getAttribute('aria-expanded') !== 'true'; navToggle.setAttribute('aria-expanded',String(open)); navToggle.setAttribute('aria-label',open ? 'Close navigation' : 'Open navigation'); navLinks.classList.toggle('is-open',open); });
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeNav(); });
document.addEventListener('click', event => { if (!event.target.closest('.nav')) closeNav(); });

// The guide travels in document coordinates. Stops are measured from actual
// headings/cards, so the route stays aligned when content or viewport changes.
// The still image is a temporary visual; there is no simulated joint motion.
const guide = document.getElementById('guide-traveler');
const guideBubble = document.getElementById('guide-bubble');
const sections = [...document.querySelectorAll('main > section[id]')];
const navItems = [...document.querySelectorAll('.nav__links a[href^="#"]')];
const guideStops = [
  { id:'about', desktop:'.section-heading h2', mobile:'.section-heading h2', text:'Here’s a little about me.', offset:0 },
  { id:'skills', desktop:'.skill-card:first-child', mobile:'.section-heading h2', text:'These are the tools I use.', offset:14 },
  { id:'projects', desktop:'.project-card:first-child', mobile:'.section-heading h2', text:'Explore what I’m building.', offset:22 },
  { id:'resume', desktop:'.resume__panel', mobile:'.resume__panel', text:'', transit:true, offset:-85 },
  { id:'contact', desktop:'h2', mobile:'h2', text:'Have an idea? Let’s talk!', offset:5 }
];
let route = [];
let guideFrame = 0;
let activeSection = '';
let lastSpeech = '';
let lastPoseKey = '';

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function ease(value) { return value * value * (3 - 2 * value); }

function measureGuideRoute() {
  const mobile = window.innerWidth < 900;
  const mainRect = main.getBoundingClientRect();
  route = guideStops.map(stop => {
    const section = document.getElementById(stop.id);
    const inner = section.querySelector('.section__inner').getBoundingClientRect();
    const target = section.querySelector(mobile ? stop.mobile : stop.desktop).getBoundingClientRect();
    return {
      ...stop,
      target: section.querySelector(mobile ? stop.mobile : stop.desktop),
      x: inner.left - mainRect.left + (mobile ? 5 : 16 + stop.offset),
      y: target.top - mainRect.top + (mobile ? -142 : stop.transit ? 35 : 4),
      scroll: target.top + window.scrollY - window.innerHeight * (mobile ? .57 : .48)
    };
  });
  queueGuideUpdate();
}

function updateGuide() {
  guideFrame = 0;
  const scroll = window.scrollY;
  const marker = window.innerHeight * .43;
  let current = sections[0];
  for (const section of sections) if (section.getBoundingClientRect().top <= marker) current = section;
  if (current.id !== activeSection) {
    activeSection = current.id;
    navItems.forEach(link => {
      if (link.getAttribute('href') === '#' + activeSection) link.setAttribute('aria-current','true');
      else link.removeAttribute('aria-current');
    });
  }
  if (!route.length) return;
  const first = route[0];
  const last = route[route.length - 1];
  let x = first.x;
  let y = first.y;
  if (scroll >= last.scroll) { x = last.x; y = last.y; }
  else if (scroll > first.scroll) {
    for (let i = 0; i < route.length - 1; i++) {
      const from = route[i];
      const to = route[i + 1];
      if (scroll > to.scroll) continue;
      const gap = to.scroll - from.scroll;
      const hold = Math.min(135, gap * .16);
      const progress = ease(clamp((scroll - from.scroll - hold) / Math.max(1, gap - hold * 2), 0, 1));
      x = from.x + (to.x - from.x) * progress;
      y = from.y + (to.y - from.y) * progress;
      break;
    }
  }
  guide.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;

  const nearest = route.reduce((best, stop) => Math.abs(stop.scroll - scroll) < Math.abs(best.scroll - scroll) ? stop : best, first);
  const targetBox = nearest.target.getBoundingClientRect();
  const targetVisible = targetBox.bottom > 110 && targetBox.top < window.innerHeight - 70;
  const distance = Math.abs(nearest.scroll - scroll);
  const mobile = window.innerWidth < 900;
  const showGuide = scroll > first.scroll - window.innerHeight * .55 && (!mobile || !nearest.transit);
  const pose = !showGuide || nearest.transit ? 'travel' : distance < 180 && targetVisible ? 'point' : distance < 290 && targetVisible ? 'turn' : 'travel';
  const speaking = pose === 'point' && distance < (mobile ? 145 : 170);
  guide.classList.toggle('is-visible', showGuide);
  guide.classList.toggle('is-speaking', speaking);
  guide.setAttribute('aria-hidden', String(!showGuide));
  guideBubble.setAttribute('aria-hidden', String(!speaking));
  guide.dataset.stop = nearest.id;
  guide.dataset.pose = pose;
  const poseKey = `${nearest.id}:${pose}`;
  if (poseKey !== lastPoseKey) {
    lastPoseKey = poseKey;
    guide.dispatchEvent(new CustomEvent('guideposechange', { detail:{ section:nearest.id, pose, target:nearest.target } }));
  }
  if (speaking && lastSpeech !== nearest.text) {
    lastSpeech = nearest.text;
    guideBubble.textContent = nearest.text;
  }
}

function queueGuideUpdate() {
  if (!guideFrame) guideFrame = window.requestAnimationFrame(updateGuide);
}
guide.hidden = false;
window.addEventListener('scroll', queueGuideUpdate, { passive:true });
window.addEventListener('resize', measureGuideRoute);
window.addEventListener('load', measureGuideRoute);
document.fonts?.ready.then(measureGuideRoute);
measureGuideRoute();

const resumeLink = document.getElementById('resume-link');
const resumeNote = document.getElementById('resume-note');
fetch('assets/resume.pdf', { method:'HEAD' }).then(response => {
  if (!response.ok || !response.headers.get('content-type')?.includes('pdf')) throw new Error('Résumé not available');
  resumeNote.textContent = 'PDF résumé';
}).catch(() => {
  resumeLink.removeAttribute('href');
  resumeLink.removeAttribute('download');
  resumeLink.setAttribute('aria-disabled','true');
  resumeLink.classList.add('is-disabled');
  resumeLink.addEventListener('click', event => event.preventDefault());
});
document.getElementById('year').textContent = new Date().getFullYear();
