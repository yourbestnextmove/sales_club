// Sticky nav background on scroll + scroll progress bar
const nav = document.getElementById('nav');
const progressBar = document.getElementById('progressBar');

function onScroll(){
  const scrolled = window.scrollY;
  nav.classList.toggle('scrolled', scrolled > 40);

  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrolled / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Scroll reveal via IntersectionObserver
const revealEls = document.querySelectorAll('.reveal');
const revealAll = () => revealEls.forEach(el => el.classList.add('is-visible'));

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('is-visible'), i * 40);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));
  // Safety net: if anything is still hidden after 2.5s (e.g. observer never
  // fired because the panel had zero height on load), reveal it anyway.
  setTimeout(revealAll, 2500);
} else {
  revealAll();
}

// FAQ accordion
document.querySelectorAll('.accordion__item').forEach(item => {
  const q = item.querySelector('.accordion__q');
  const a = item.querySelector('.accordion__a');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.accordion__item.open').forEach(open => {
      if (open !== item) {
        open.classList.remove('open');
        open.querySelector('.accordion__a').style.maxHeight = null;
      }
    });
    item.classList.toggle('open', !isOpen);
    a.style.maxHeight = !isOpen ? a.scrollHeight + 'px' : null;
  });
});

// Mobile menu burger toggles nav links
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav__links');
if (burger) {
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    if (open) {
      navLinks.style.display = 'flex';
      navLinks.style.position = 'fixed';
      navLinks.style.top = '64px';
      navLinks.style.left = '0';
      navLinks.style.right = '0';
      navLinks.style.flexDirection = 'column';
      navLinks.style.background = 'var(--navy)';
      navLinks.style.padding = '20px 24px';
      navLinks.style.gap = '16px';
    } else {
      navLinks.style.display = 'none';
    }
  });
}

// Subtle parallax on hero blobs
const blobs = document.querySelectorAll('.blob');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  blobs.forEach((b, i) => {
    b.style.transform = `translateY(${y * (0.15 + i * 0.08)}px)`;
  });
}, { passive: true });
