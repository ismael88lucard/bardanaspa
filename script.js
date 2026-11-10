const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Año dinámico en el footer
document.getElementById('year').textContent = new Date().getFullYear();

// Nav: sombra al hacer scroll + barra de progreso de lectura
const nav = document.getElementById('nav');
const progressBar = document.getElementById('progressBar');
function onScroll() {
  nav.classList.toggle('scrolled', window.scrollY > 20);
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Menú móvil
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
function setMenu(open) {
  navLinks.classList.toggle('open', open);
  burger.classList.toggle('active', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}
burger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('open') && !nav.contains(e.target)) setMenu(false);
});

// Resalta el enlace del menú de la sección visible
const navAnchorLinks = navLinks.querySelectorAll('a[href^="#"]');
const trackedSections = Array.from(navAnchorLinks)
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.getAttribute('id');
    navAnchorLinks.forEach(a => {
      const isActive = a.getAttribute('href') === '#' + id;
      a.classList.toggle('active', isActive);
      if (isActive) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });
trackedSections.forEach(el => sectionObserver.observe(el));

// Aparición suave de cada bloque al llegar a él
const revealTargets = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !prefersReduced) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach(el => revealObserver.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('visible'));
}

// Contador animado para las cifras de "Nosotros"
const counters = document.querySelectorAll('[data-count]');
if (!prefersReduced && 'IntersectionObserver' in window) {
  counters.forEach(el => { el.textContent = '0' + (el.dataset.suffix || ''); });
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(el => counterObserver.observe(el));
}

// Videos: cargan y se reproducen solo cuando están a la vista (ahorra datos y batería)
const videos = document.querySelectorAll('video[data-autoplay]');
if (prefersReduced || !('IntersectionObserver' in window)) {
  videos.forEach(v => { v.controls = true; v.preload = 'metadata'; });
} else {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const v = entry.target;
      if (entry.isIntersecting) {
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.35 });
  videos.forEach(v => videoObserver.observe(v));
}

// Parallax sutil de la rama dorada en el hero (solo escritorio con mouse)
const heroBranch = document.querySelector('.hero__branch');
if (!prefersReduced && heroBranch && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelector('.hero').addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    heroBranch.style.transform = `translate(${x * -10}px, ${y * -8}px)`;
  });
}
