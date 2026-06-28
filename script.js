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
    { el: document.querySelector('.cog--a'), cx: 95, cy: 165, s: 1.25, k: 0.05 },  // big, slow
    { el: document.querySelector('.cog--b'), cx: 40, cy: 380, s: 1.0, k: -0.08 },  // medium, opposite
    { el: document.querySelector('.cog--c'), cx: 120, cy: 560, s: 0.78, k: 0.13 }  // small, fast
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

// Bouncing SALES / CLUB letters in the pain panel (DVD-bounce physics)
(function () {
  const wrap = document.querySelector('.bounce');
  const section = document.querySelector('.pain');
  if (!wrap || !section) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const chars = 'SALESCLUB'.split('');               // 0-4 SALES, 5-8 CLUB
  const els = chars.map(c => {
    const s = document.createElement('span');
    s.className = 'bounce__l';
    s.textContent = c;
    wrap.appendChild(s);
    return s;
  });

  let W = 0, H = 0, parts = [], raf = null, released = false;

  function layout() {
    W = wrap.clientWidth; H = wrap.clientHeight;
    const gap = 6, pad = 36;
    const w = els.map(e => e.offsetWidth);
    const h = els.map(e => e.offsetHeight);
    const lh = h[0] || 90;
    const salesW = w.slice(0, 5).reduce((a, b) => a + b, 0) + gap * 4;
    const clubW = w.slice(5).reduce((a, b) => a + b, 0) + gap * 3;
    parts = [];
    let x = Math.max(10, W - pad - salesW);
    const y1 = Math.max(10, H * 0.5 - lh - 4);
    for (let i = 0; i < 5; i++) { parts.push({ el: els[i], x, y: y1, w: w[i], h: h[i] }); x += w[i] + gap; }
    let x2 = Math.max(10, W - pad - clubW);
    const y2 = y1 + lh + 4;
    for (let i = 5; i < 9; i++) { parts.push({ el: els[i], x: x2, y: y2, w: w[i], h: h[i] }); x2 += w[i] + gap; }
    draw();
  }

  function draw() {
    for (const p of parts) p.el.style.transform = 'translate(' + p.x + 'px,' + p.y + 'px)';
  }

  function release() {
    if (released) return;
    released = true;
    for (const p of parts) {
      const a = Math.random() * Math.PI * 2, sp = 0.4 + Math.random() * 0.35;
      p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp;
    }
    start();
  }

  function step() {
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x <= 0) { p.x = 0; p.vx *= -1; } else if (p.x + p.w >= W) { p.x = W - p.w; p.vx *= -1; }
      if (p.y <= 0) { p.y = 0; p.vy *= -1; } else if (p.y + p.h >= H) { p.y = H - p.h; p.vy *= -1; }
    }
    draw();
    raf = requestAnimationFrame(step);
  }
  function start() { if (!raf) raf = requestAnimationFrame(step); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  layout();
  window.addEventListener('resize', () => { if (!released) layout(); });
  if (reduce) return; // stay in the stacked formation, no motion

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { released ? start() : setTimeout(release, 1100); }
        else stop();
      });
    }, { threshold: 0.25 }).observe(section);
  } else {
    setTimeout(release, 1100);
  }
})();

// Subtle parallax on hero blobs
const blobs = document.querySelectorAll('.blob');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  blobs.forEach((b, i) => {
    b.style.transform = `translateY(${y * (0.15 + i * 0.08)}px)`;
  });
}, { passive: true });
