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

// Hero drifting-dots background (lightweight canvas, no library)
(function () {
  const canvas = document.querySelector('.hero__canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const colors = ['0,223,236', '0,160,253', '120,150,255']; // brand cyan / blue
  let w = 0, h = 0, particles = [], raf = null;

  function build() {
    const r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, (w * h) / 14000));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 2 + 0.6,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        a: Math.random() * 0.35 + 0.08,
        c: colors[(Math.random() * colors.length) | 0]
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -5) p.x = w + 5; else if (p.x > w + 5) p.x = -5;
      if (p.y < -5) p.y = h + 5; else if (p.y > h + 5) p.y = -5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.c + ',' + p.a + ')';
      ctx.fill();
    }
  }

  function loop() { draw(); raf = requestAnimationFrame(loop); }

  build();
  window.addEventListener('resize', build);

  if (reduce) {
    draw(); // static field, no motion
  } else {
    loop();
    // pause the loop when the hero scrolls out of view (saves CPU)
    const hero = document.querySelector('.hero');
    if ('IntersectionObserver' in window && hero) {
      new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { if (!raf) loop(); }
          else if (raf) { cancelAnimationFrame(raf); raf = null; }
        });
      }, { threshold: 0 }).observe(hero);
    }
  }
})();

// Scroll-driven cogs in the "How it works" section (meshing gear train)
(function () {
  const cogs = [
    { el: document.querySelector('.cog--a'), cx: 95, cy: 165, s: 1.25, k: 0.05 },  // left: big, slow
    { el: document.querySelector('.cog--b'), cx: 40, cy: 380, s: 1.0, k: -0.08 },  // left: medium, opposite
    { el: document.querySelector('.cog--c'), cx: 120, cy: 560, s: 0.78, k: 0.13 }, // left: small, fast
    { el: document.querySelector('.cog--d'), cx: 1120, cy: 130, s: 1.15, k: -0.06 }, // right
    { el: document.querySelector('.cog--e'), cx: 1045, cy: 300, s: 0.9, k: 0.09 },
    { el: document.querySelector('.cog--f'), cx: 1165, cy: 365, s: 0.68, k: -0.13 },
    { el: document.querySelector('.cog--g'), cx: 1085, cy: 545, s: 1.05, k: 0.07 },
    { el: document.querySelector('.cog--h'), cx: 1175, cy: 630, s: 0.58, k: -0.15 }
  ].filter(c => c.el);
  if (!cogs.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;
  function update() {
    ticking = false;
    const y = window.scrollY;
    // translate to centre, rotate around it, then scale (spins in place)
    for (const c of cogs) {
      c.el.setAttribute('transform',
        'translate(' + c.cx + ',' + c.cy + ') rotate(' + (y * c.k) + ') scale(' + c.s + ')');
    }
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

// Torch / spotlight on the "What is Sales Club" statement
(function () {
  const st = document.querySelector('.mechanism__statement');
  if (!st || !window.matchMedia('(hover:hover)').matches) return;
  st.addEventListener('pointermove', e => {
    const r = st.getBoundingClientRect();
    st.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    st.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
  st.addEventListener('pointerleave', () => {
    st.style.setProperty('--mx', '50%');
    st.style.setProperty('--my', '42%');
  });
})();

// Subtle parallax on hero blobs
const blobs = document.querySelectorAll('.blob');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  blobs.forEach((b, i) => {
    b.style.transform = `translateY(${y * (0.15 + i * 0.08)}px)`;
  });
}, { passive: true });
